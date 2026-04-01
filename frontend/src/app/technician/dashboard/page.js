'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPut } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import '../../dashboard/dashboard.css';

const STATUS_COLORS = {
  pending: 'badge-warning', accepted: 'badge-info', in_progress: 'badge-accent',
  completed: 'badge-success', cancelled: 'badge-danger', disputed: 'badge-danger',
};

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'technician') { router.push('/'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqData, subData] = await Promise.all([
        apiGet('/requests'),
        apiGet('/technicians/me/subscription')
      ]);
      setRequests(reqData.requests || []);
      setSubscription(subData);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await apiGet('/requests');
      setRequests(data.requests || []);
    } catch (err) { console.error(err); }
  };

  const handleAccept = async (id) => {
    try {
      await apiPut(`/requests/${id}/accept`);
      fetchRequests();
    } catch (err) { alert(err.message); }
  };

  const handleComplete = async (id) => {
    if (!confirm('Mark this job as completed?')) return;
    try {
      await apiPut(`/requests/${id}/complete`);
      fetchRequests();
    } catch (err) { alert(err.message); }
  };

  const filteredRequests = tab === 'all' ? requests : requests.filter(r => r.status === tab);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dash-header animate-fadeInUp">
          <div>
            <h1 className="dash-title">Technician Dashboard 🛠️</h1>
            <p className="dash-subtitle">Manage your jobs and track earnings</p>
          </div>
          <div style={{display: 'flex', gap: 10}}>
            <Link href="/technician/subscription" className={`badge ${subscription?.is_active ? 'badge-success' : 'badge-danger'}`} style={{textDecoration: 'none', padding: '10px 15px', display: 'flex', alignItems: 'center'}}>
              {subscription?.is_active ? '✅ Subscribed' : '⚠️ Unsubscribed'}
            </Link>
            <Link href="/technician/profile" className="btn btn-secondary">Edit Profile</Link>
          </div>
        </div>

        {!loading && !subscription?.is_active && (
          <div className="card animate-fadeInUp" style={{background: '#fff4f4', border: '1px solid #ffcccc', padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h3 style={{color: '#d32f2f', marginBottom: 5}}>Subscription Inactive</h3>
              <p style={{color: '#666'}}>You are hidden from search results. Renew your subscription to receive new job requests.</p>
            </div>
            <Link href="/technician/subscription" className="btn btn-primary">Renew Now</Link>
          </div>
        )}

        <div className="dash-stats animate-fadeInUp">
          <div className="dash-stat-card">
            <span className="dash-stat-icon">📋</span>
            <span className="dash-stat-value">{requests.length}</span>
            <span className="dash-stat-label">Total Jobs</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">⏳</span>
            <span className="dash-stat-value">{requests.filter(r => r.status === 'pending').length}</span>
            <span className="dash-stat-label">New Requests</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">🔄</span>
            <span className="dash-stat-value">{requests.filter(r => r.status === 'in_progress' || r.status === 'accepted').length}</span>
            <span className="dash-stat-label">Active Jobs</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">✅</span>
            <span className="dash-stat-value">{requests.filter(r => r.status === 'completed').length}</span>
            <span className="dash-stat-label">Completed</span>
          </div>
        </div>

        <div className="dash-tabs">
          {['all', 'pending', 'accepted', 'in_progress', 'completed'].map(t => (
            <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

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
                      {req.service_icon} {req.service_name || 'General'} • 👤 {req.customer_name} • {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                </div>
                <p className="request-card-desc">{req.description?.slice(0, 150)}</p>
                <div className="request-card-footer">
                  <div className="request-card-info">
                    {req.budget && <span>💰 KES {Number(req.budget).toLocaleString()}</span>}
                    {req.location && <span>📍 {req.location}</span>}
                  </div>
                  <div className="request-card-actions">
                    <Link href={`/chat/${req.id}`} className="btn btn-sm btn-secondary">💬 Chat</Link>
                    {req.status === 'pending' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleAccept(req.id)}>Accept Job</button>
                    )}
                    {(req.status === 'accepted' || req.status === 'in_progress') && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleComplete(req.id)}>Mark Complete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results" style={{paddingTop: 40}}>
            <span className="no-results-icon">🛠️</span>
            <h3>No jobs yet</h3>
            <p>Complete your profile to start receiving job requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
