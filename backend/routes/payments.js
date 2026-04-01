const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { stkPush } = require('../config/mpesa');

const router = express.Router();

// Initiate M-Pesa STK Push
router.post('/stk-push', authenticate, async (req, res) => {
  try {
    const { request_id, phone, amount } = req.body;

    if (!request_id || !phone || !amount) {
      return res.status(400).json({ error: 'Request ID, phone, and amount are required' });
    }

    // Get the service request
    const serviceReq = await pool.query(
      'SELECT * FROM service_requests WHERE id = $1 AND customer_id = $2',
      [request_id, req.user.id]
    );
    if (serviceReq.rows.length === 0) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    // Format phone (ensure 254 prefix)
    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    // Initiate STK Push
    const mpesaResponse = await stkPush({
      phone: formattedPhone,
      amount: Math.ceil(amount),
      accountReference: `FF-${request_id.slice(0, 8)}`,
      description: `FindFix Payment for ${serviceReq.rows[0].title}`,
    });

    // Create transaction record
    await pool.query(
      `INSERT INTO transactions (id, request_id, customer_id, technician_id, amount, phone, checkout_request_id, merchant_request_id, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        request_id,
        req.user.id,
        serviceReq.rows[0].technician_id,
        amount,
        formattedPhone,
        mpesaResponse.CheckoutRequestID,
        mpesaResponse.MerchantRequestID,
      ]
    );

    res.json({
      message: 'STK Push sent. Check your phone.',
      checkoutRequestId: mpesaResponse.CheckoutRequestID,
    });
  } catch (err) {
    console.error('STK Push error:', err);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// Initiate M-Pesa STK Push for Subscription (KSH 500)
router.post('/stk-push/subscription', authenticate, async (req, res) => {
  try {
    const { phone } = req.body;
    const amount = 500; // Fixed subscription price

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if the user is a technician
    if (req.user.role !== 'technician') {
      return res.status(403).json({ error: 'Only technicians can subscribe' });
    }

    // Format phone (ensure 254 prefix)
    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    // Initiate STK Push
    const mpesaResponse = await stkPush({
      phone: formattedPhone,
      amount: amount,
      accountReference: `SUB-${req.user.id.slice(0, 8)}`,
      description: `FindFix Monthly Subscription`,
    });

    // Create transaction record
    await pool.query(
      `INSERT INTO transactions (id, customer_id, amount, phone, checkout_request_id, merchant_request_id, status, transaction_type)
       VALUES (UUID(), ?, ?, ?, ?, ?, 'pending', 'subscription')`,
      [
        req.user.id,
        amount,
        formattedPhone,
        mpesaResponse.CheckoutRequestID,
        mpesaResponse.MerchantRequestID,
      ]
    );

    res.json({
      message: 'Subscription push sent. Check your phone.',
      checkoutRequestId: mpesaResponse.CheckoutRequestID,
    });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: 'Subscription initiation failed' });
  }
});

// M-Pesa callback
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const items = CallbackMetadata.Item;
      const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

      // Update transaction status
      await pool.query(
        `UPDATE transactions SET status = 'completed', mpesa_receipt = $1, updated_at = NOW()
         WHERE checkout_request_id = $2`,
        [receipt, CheckoutRequestID]
      );

      // Get transaction details to proceed
      const tx = await pool.query(
        'SELECT * FROM transactions WHERE checkout_request_id = $1',
        [CheckoutRequestID]
      );

      if (tx.rows.length > 0) {
        const transaction = tx.rows[0];

        if (transaction.transaction_type === 'subscription') {
          // Extension for 30 days
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await pool.query(
            `UPDATE technicians SET subscription_expires_at = $1, updated_at = NOW() WHERE user_id = $2`,
            [expiresAt, transaction.customer_id] // transaction.customer_id is actually the technician's user_id if it's a sub
          );
        } else {
          // Update service request status to in_progress (existing logic)
          await pool.query(
            `UPDATE service_requests SET status = 'in_progress', updated_at = NOW() WHERE id = $1`,
            [transaction.request_id]
          );
        }
      }
    } else {
      // Payment failed
      await pool.query(
        `UPDATE transactions SET status = 'failed', updated_at = NOW() WHERE checkout_request_id = $1`,
        [CheckoutRequestID]
      );
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error('Callback error:', err);
    res.json({ ResultCode: 1, ResultDesc: 'Error' });
  }
});

// Get transactions (admin or own)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query, params;

    if (req.user.role === 'admin') {
      query = `
        SELECT t.*, cu.name as customer_name, tu.name as technician_name, sr.title as request_title
        FROM transactions t
        JOIN users cu ON t.customer_id = cu.id
        JOIN technicians tech ON t.technician_id = tech.id
        JOIN users tu ON tech.user_id = tu.id
        JOIN service_requests sr ON t.request_id = sr.id
        ORDER BY t.created_at DESC LIMIT $1 OFFSET $2
      `;
      params = [parseInt(limit), parseInt(offset)];
    } else {
      query = `
        SELECT t.*, sr.title as request_title
        FROM transactions t
        JOIN service_requests sr ON t.request_id = sr.id
        WHERE t.customer_id = $1
        ORDER BY t.created_at DESC LIMIT $2 OFFSET $3
      `;
      params = [req.user.id, parseInt(limit), parseInt(offset)];
    }

    const result = await pool.query(query, params);
    res.json({ transactions: result.rows, page: parseInt(page) });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
