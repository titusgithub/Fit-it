'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPut, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './dashboard.css';

const STATUS_COLORS = {
  pending: 'badge-warning', accepted: 'badge-info', in_progress: 'badge-accent',
  completed: 'badge-success', cancelled: 'badge-danger', disputed: 'badge-danger',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'customer') { router.push('/'); return; }
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const data = await apiGet('/requests');
      setRequests(data.requests || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredRequests = tab === 'all' ? requests : requests.filter(r => r.status === tab);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this request?')) return;
    try {
      await apiPut(`/requests/${id}/cancel`);
      fetchRequests();
    } catch (err) { alert(err.message); }
  };

  const handleDispute = async (id) => {
    const reason = prompt('Describe the issue:');
    if (!reason) return;
    try {
      await apiPost('/admin/disputes', { request_id: id, reason });
      fetchRequests();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dash-header animate-fadeInUp">
          <div>
            <h1 className="dash-title">Welcome, {user?.name} 👋</h1>
            <p className="dash-subtitle">Manage your service requests and payments</p>
          </div>
          <Link href="/request/new" className="btn btn-primary">+ New Request</Link>
        </div>

        {/* Stats */}
        <div className="dash-stats animate-fadeInUp">
          <div className="dash-stat-card">
            <span className="dash-stat-icon">📋</span>
            <span className="dash-stat-value">{requests.length}</span>
            <span className="dash-stat-label">Total Requests</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">⏳</span>
            <span className="dash-stat-value">{requests.filter(r => r.status === 'pending').length}</span>
            <span className="dash-stat-label">Pending</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">🔄</span>
            <span className="dash-stat-value">{requests.filter(r => r.status === 'in_progress').length}</span>
            <span className="dash-stat-label">In Progress</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">✅</span>
            <span className="dash-stat-value">{requests.filter(r => r.status === 'completed').length}</span>
            <span className="dash-stat-label">Completed</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['all', 'pending', 'accepted', 'in_progress', 'completed'].map(t => (
            <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Requests */}
        {loading ? (
          <div className="dash-loading">Loading...</div>
        ) : filteredRequests.length > 0 ? (
          <div className="requests-list">
            {filteredRequests.map(req => (
              <div key={req.id} className="request-card card">
                <div className="request-card-header">
                  <div>
                    <h3 className="request-card-title">{req.title}</h3>
                    <p className="request-card-meta">
                      {req.service_icon} {req.service_name || 'General'} • {req.location || 'No location'} • {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[req.status] || 'badge-info'}`}>{req.status}</span>
                </div>
                <p className="request-card-desc">{req.description?.slice(0, 150)}{req.description?.length > 150 ? '...' : ''}</p>
                <div className="request-card-footer">
                  <div className="request-card-info">
                    {req.budget && <span>💰 KES {Number(req.budget).toLocaleString()}</span>}
                    {req.technician_name && <span>🛠️ {req.technician_name}</span>}
                  </div>
                  <div className="request-card-actions">
                    {req.technician_id && req.status !== 'cancelled' && req.status !== 'completed' && (
                      <Link href={`/chat/${req.id}`} className="btn btn-sm btn-secondary">💬 Chat</Link>
                    )}
                    {req.status === 'pending' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleCancel(req.id)}>Cancel</button>
                    )}
                    {req.status === 'in_progress' && (
                      <button className="btn btn-sm btn-secondary" style={{color:'var(--danger)'}} onClick={() => handleDispute(req.id)}>⚠️ Dispute</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results" style={{paddingTop: 40}}>
            <span className="no-results-icon">📋</span>
            <h3>No requests found</h3>
            <p>Post your first service request to get started</p>
            <Link href="/request/new" className="btn btn-primary" style={{marginTop: 16}}>Post a Request</Link>
          </div>
        )}
      </div>
    </div>
  );
}
