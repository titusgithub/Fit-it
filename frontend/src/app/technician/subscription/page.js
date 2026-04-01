'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import '../../dashboard/dashboard.css';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState(user?.phone || '');
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'technician') { router.push('/'); return; }
    fetchStatus();
  }, [user]);

  const fetchStatus = async () => {
    try {
      const data = await apiGet('/technicians/me/subscription');
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    setMessage('');
    try {
      const res = await apiPost('/payments/stk-push/subscription', { phone });
      setMessage(res.message || 'Payment request sent! Check your phone.');
    } catch (err) {
      setMessage(err.message || 'Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Loading...</div>;

  const isExpired = !status?.is_active;
  const expiryDate = status?.subscription_expires_at ? new Date(status.subscription_expires_at).toLocaleDateString() : 'Never subscribed';

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dash-header animate-fadeInUp">
          <div>
            <h1 className="dash-title">Service Subscription 💎</h1>
            <p className="dash-subtitle">Stay visible and receive more jobs</p>
          </div>
        </div>

        <div className="animate-fadeInUp" style={{maxWidth: 600, margin: '20px 0'}}>
          <div className="card" style={{padding: 30}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <h3>Subscription Status</h3>
              <span className={`badge ${status?.is_active ? 'badge-success' : 'badge-danger'}`}>
                {status?.is_active ? 'Active' : 'Expired / Inactive'}
              </span>
            </div>
            
            <div style={{marginBottom: 20}}>
              <p><strong>Monthly Cost:</strong> KES {status?.monthly_cost || 500}</p>
              <p><strong>Expiry Date:</strong> {expiryDate}</p>
            </div>

            {isExpired ? (
              <div style={{background: '#fff4f4', padding: 15, borderRadius: 8, color: '#d32f2f', marginBottom: 20}}>
                <p>⚠️ Your subscription is expired. You won't appear in search results or receive new job requests until you renew.</p>
              </div>
            ) : (
              <div style={{background: '#f4fff4', padding: 15, borderRadius: 8, color: '#2e7d32', marginBottom: 20}}>
                <p>✅ Your subscription is active. You are currently visible to customers.</p>
              </div>
            )}

            <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />

            <form onSubmit={handlePay}>
              <h4>Renew / Extend Subscription</h4>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: 15}}>
                Enter your M-Pesa phone number to receive a payment prompt for KES 500.
              </p>
              
              <div style={{marginBottom: 15}}>
                <label style={{display: 'block', marginBottom: 5, fontSize: '0.9rem'}}>M-Pesa Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  style={{
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: 8, 
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{width: '100%'}}
                disabled={paying}
              >
                {paying ? 'Processing...' : 'Pay KES 500 with M-Pesa'}
              </button>

              {message && (
                <p style={{marginTop: 15, textAlign: 'center', fontWeight: 'bold', color: message.includes('failed') ? 'red' : 'green'}}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
