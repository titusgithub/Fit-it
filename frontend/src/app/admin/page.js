'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPut } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './admin.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [pendingTechs, setPendingTechs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsData, techsData, usersData, disputesData, txData] = await Promise.all([
        apiGet('/admin/stats'),
        apiGet('/technicians?verified=false'),
        apiGet('/users?limit=10'),
        apiGet('/admin/disputes'),
        apiGet('/payments'),
      ]);
      setStats(statsData);
      setPendingTechs(techsData.technicians || []);
      setRecentUsers(usersData.users || []);
      setDisputes(disputesData.disputes || []);
      setTransactions(txData.transactions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const verifyTechnician = async (id) => {
    try {
      await apiPut(`/admin/verify/${id}`);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const resolveDispute = async (id) => {
    const resolution = prompt('Enter resolution:');
    if (!resolution) return;
    try {
      await apiPut(`/admin/disputes/${id}/resolve`, { resolution, status: 'resolved' });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="container" style={{padding:'80px 0', textAlign:'center'}}>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-layout">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
              <span>🔧</span>
              <h3>FindFix Admin</h3>
            </div>
            <nav className="admin-nav">
              {[
                { id: 'overview', icon: '📊', label: 'Overview' },
                { id: 'technicians', icon: '🛠️', label: 'Technicians' },
                { id: 'users', icon: '👥', label: 'Users' },
                { id: 'transactions', icon: '💰', label: 'Transactions' },
                { id: 'disputes', icon: '⚠️', label: 'Disputes' },
              ].map(item => (
                <button key={item.id}
                  className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}>
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="admin-main">
            {activeTab === 'overview' && (
              <div className="animate-fadeIn">
                <h1 className="admin-title">Dashboard Overview</h1>
                {stats && (
                  <div className="admin-stats-grid">
                    <div className="admin-stat-card"><span className="admin-stat-icon">👥</span><span className="admin-stat-value">{stats.users?.total || 0}</span><span className="admin-stat-label">Total Users</span></div>
                    <div className="admin-stat-card"><span className="admin-stat-icon">🛠️</span><span className="admin-stat-value">{stats.technicians?.total || 0}</span><span className="admin-stat-label">Technicians</span></div>
                    <div className="admin-stat-card"><span className="admin-stat-icon">✅</span><span className="admin-stat-value">{stats.technicians?.verified || 0}</span><span className="admin-stat-label">Verified</span></div>
                    <div className="admin-stat-card"><span className="admin-stat-icon">📋</span><span className="admin-stat-value">{stats.requests?.total || 0}</span><span className="admin-stat-label">Total Requests</span></div>
                    <div className="admin-stat-card"><span className="admin-stat-icon">⏳</span><span className="admin-stat-value">{stats.requests?.pending || 0}</span><span className="admin-stat-label">Pending</span></div>
                    <div className="admin-stat-card"><span className="admin-stat-icon">✅</span><span className="admin-stat-value">{stats.requests?.completed || 0}</span><span className="admin-stat-label">Completed</span></div>
                    <div className="admin-stat-card wide"><span className="admin-stat-icon">💰</span><span className="admin-stat-value">KES {Number(stats.transactions?.revenue || 0).toLocaleString()}</span><span className="admin-stat-label">Total Revenue</span></div>
                    <div className="admin-stat-card"><span className="admin-stat-icon">🧾</span><span className="admin-stat-value">{stats.transactions?.total || 0}</span><span className="admin-stat-label">Transactions</span></div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'technicians' && (
              <div className="animate-fadeIn">
                <h1 className="admin-title">Technician Verification</h1>
                <p className="admin-subtitle">{pendingTechs.length} pending verification</p>
                {pendingTechs.length > 0 ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Location</th><th>Experience</th><th>Services</th><th>Action</th></tr></thead>
                      <tbody>
                        {pendingTechs.map(tech => (
                          <tr key={tech.id}>
                            <td><strong>{tech.name}</strong><br/><span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{tech.email}</span></td>
                            <td>{tech.location || '—'}</td>
                            <td>{tech.years_experience || 0} yrs</td>
                            <td>{(tech.services||[]).map(s => s.service_name).join(', ') || '—'}</td>
                            <td><button className="btn btn-sm btn-primary" onClick={() => verifyTechnician(tech.id)}>✓ Verify</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p style={{color:'var(--text-muted)', padding:'32px 0'}}>No pending technicians</p>}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="animate-fadeIn">
                <h1 className="admin-title">User Management</h1>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
                    <tbody>
                      {recentUsers.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>{u.phone}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'technician' ? 'badge-accent' : 'badge-info'}`}>{u.role}</span></td>
                          <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="animate-fadeIn">
                <h1 className="admin-title">Transaction Management</h1>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Request</th><th>Customer</th><th>Technician</th><th>Amount</th><th>Status</th><th>Receipt</th><th>Date</th></tr></thead>
                    <tbody>
                      {transactions.length > 0 ? transactions.map(tx => (
                        <tr key={tx.id}>
                          <td>{tx.request_title || '—'}</td>
                          <td>{tx.customer_name || '—'}</td>
                          <td>{tx.technician_name || '—'}</td>
                          <td><strong>KES {Number(tx.amount).toLocaleString()}</strong></td>
                          <td><span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>{tx.status}</span></td>
                          <td>{tx.mpesa_receipt || '—'}</td>
                          <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                        </tr>
                      )) : <tr><td colSpan={7} style={{textAlign:'center',padding:32}}>No transactions yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'disputes' && (
              <div className="animate-fadeIn">
                <h1 className="admin-title">Dispute Handling</h1>
                {disputes.length > 0 ? (
                  <div className="disputes-list">
                    {disputes.map(d => (
                      <div key={d.id} className="dispute-card card">
                        <div className="dispute-header">
                          <div>
                            <h3>{d.request_title}</h3>
                            <p style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>
                              Raised by {d.raised_by_name} • {new Date(d.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`badge ${d.status === 'open' ? 'badge-danger' : d.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span>
                        </div>
                        <p style={{marginTop:8, color:'var(--text-secondary)', fontSize:'0.9rem'}}>{d.reason}</p>
                        {d.resolution && <p style={{marginTop:8, color:'var(--success)', fontSize:'0.88rem'}}>✅ {d.resolution}</p>}
                        {d.status === 'open' && (
                          <button className="btn btn-sm btn-primary" style={{marginTop:12}} onClick={() => resolveDispute(d.id)}>Resolve</button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p style={{color:'var(--text-muted)', padding:'32px 0'}}>No disputes</p>}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
