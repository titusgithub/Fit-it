'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPut, apiDelete } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './admin.css';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [pendingTechs, setPendingTechs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role.toLowerCase() !== 'admin') {
      // Stay on page but show unauthorized state
      setLoading(false);
      return;
    }
    fetchData();
  }, [user, authLoading]);

  // Handle unauthorized state
  if (!authLoading && user && user.role.toLowerCase() !== 'admin') {
    return (
      <div className="admin-page" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh'}}>
        <div className="card-glass" style={{textAlign:'center', maxWidth:400, padding:40}}>
          <h2 style={{color:'var(--danger)', marginBottom:16}}>Access Denied</h2>
          <p style={{color:'var(--text-secondary)', marginBottom:24}}>
            You do not have administrative permissions to view this dashboard.
          </p>
          <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:24}}>
            If you were just granted rights, please <strong>log out and log back in</strong> to refresh your session.
          </p>
          <Link href="/" className="btn btn-primary">Return Home</Link>
        </div>
      </div>
    );
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, techsData, usersData, disputesData, txData] = await Promise.all([
        apiGet('/admin/stats'),
        apiGet('/technicians?verified=false'),
        apiGet('/users?limit=20'), // Increased limit for management
        apiGet('/admin/disputes'),
        apiGet('/payments'),
      ]);
      setStats(statsData);
      setPendingTechs(techsData.technicians || []);
      setRecentUsers(usersData.users || []);
      setDisputes(disputesData.disputes || []);
      setTransactions(txData.transactions || []);
    } catch (err) { 
      console.error('Admin Fetch Error:', err); 
    } finally { 
      setLoading(false); 
    }
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

  const updateUserRole = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user to ${newRole}?`)) return;
    try {
      await apiPut(`/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this account?`)) return;
    try {
      await apiPut(`/users/${userId}/status`, { is_active: !currentStatus });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('CRITICAL: Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
    try {
      await apiDelete(`/users/${userId}`);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const renderSkeletonTable = (rows = 5) => (
    <div className="admin-table-container">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton admin-skeleton-row" style={{ opacity: 1 - (i * 0.15) }} />
      ))}
    </div>
  );

  const renderSkeletonStats = () => (
    <div className="admin-stats-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton admin-skeleton-card" />
      ))}
      <div className="skeleton admin-skeleton-card wide" />
      <div className="skeleton admin-skeleton-card" />
    </div>
  );

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
                <header className="admin-header-section">
                  <h1 className="admin-title">Dashboard Overview</h1>
                  <p className="admin-subtitle">Monitor platform activity and growth</p>
                </header>
                
                {loading ? renderSkeletonStats() : stats && (
                  <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                      <div className="admin-stat-icon">👥</div>
                      <span className="admin-stat-value">{stats.users?.total || 0}</span>
                      <span className="admin-stat-label">Total Users</span>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-icon">🛠️</div>
                      <span className="admin-stat-value">{stats.technicians?.total || 0}</span>
                      <span className="admin-stat-label">Technicians</span>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-icon">✅</div>
                      <span className="admin-stat-value">{stats.technicians?.verified || 0}</span>
                      <span className="admin-stat-label">Verified Pros</span>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-icon">📋</div>
                      <span className="admin-stat-value">{stats.requests?.total || 0}</span>
                      <span className="admin-stat-label">Service Requests</span>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-icon">⏳</div>
                      <span className="admin-stat-value">{stats.requests?.pending || 0}</span>
                      <span className="admin-stat-label">Pending Jobs</span>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-icon">🏁</div>
                      <span className="admin-stat-value">{stats.requests?.completed || 0}</span>
                      <span className="admin-stat-label">Completed Jobs</span>
                    </div>
                    <div className="admin-stat-card wide">
                      <div className="admin-stat-icon">💰</div>
                      <span className="admin-stat-value">KES {Number(stats.transactions?.revenue || 0).toLocaleString()}</span>
                      <span className="admin-stat-label">Gross Platform Revenue</span>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-icon">🧾</div>
                      <span className="admin-stat-value">{stats.transactions?.total || 0}</span>
                      <span className="admin-stat-label">Processed Bills</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'technicians' && (
              <div className="animate-fadeIn">
                <header className="admin-header-section">
                  <h1 className="admin-title">Technician Verification</h1>
                  <p className="admin-subtitle">{pendingTechs.length} professionals awaiting approval</p>
                </header>
                
                {loading ? renderSkeletonTable() : pendingTechs.length > 0 ? (
                  <div className="admin-table-container">
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Name</th><th>Location</th><th>Experience</th><th>Services</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {pendingTechs.map(tech => (
                            <tr key={tech.id}>
                              <td>
                                <div style={{display:'flex', flexDirection:'column'}}>
                                  <span style={{fontWeight:'700'}}>{tech.name}</span>
                                  <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{tech.email}</span>
                                </div>
                              </td>
                              <td>{tech.location || '—'}</td>
                              <td><span className="badge badge-info">{tech.years_experience || 0} yrs</span></td>
                              <td>
                                <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                                  {/* Defensive check for array to prevent "map is not a function" */}
                                  {Array.isArray(tech.services) ? tech.services.map((s, idx) => (
                                    <span key={idx} className="badge badge-accent" style={{fontSize:'0.65rem', padding:'2px 8px'}}>{s.service_name}</span>
                                  )) : <span className="text-muted">No services</span>}
                                  {Array.isArray(tech.services) && tech.services.length === 0 && '—'}
                                </div>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-primary" onClick={() => verifyTechnician(tech.id)}>
                                  Verify
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="card-glass" style={{textAlign:'center', padding:'60px 20px'}}>
                    <p style={{color:'var(--text-muted)', fontSize:'1.1rem'}}>No technicians currently pending verification.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="animate-fadeIn">
                <header className="admin-header-section">
                  <h1 className="admin-title">User Management</h1>
                  <p className="admin-subtitle">Grant rights, manage roles, and control account status</p>
                </header>
                
                {loading ? renderSkeletonTable(10) : (
                  <div className="admin-table-container">
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr><th>User</th><th>Contact</th><th>Role & Status</th><th>Manage Rights</th><th>Account</th></tr>
                        </thead>
                        <tbody>
                          {recentUsers.map(u => (
                            <tr key={u.id}>
                              <td><strong>{u.name}</strong></td>
                              <td>
                                <div style={{display:'flex', flexDirection:'column'}}>
                                  <span style={{fontSize:'0.85rem'}}>{u.email}</span>
                                  <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{u.phone}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{display:'flex', gap:6, alignItems:'center'}}>
                                  <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'technician' ? 'badge-accent' : 'badge-info'}`}>{u.role}</span>
                                  <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Banned'}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{display:'flex', gap:8}}>
                                  {u.role !== 'admin' && (
                                    <button className="btn btn-sm btn-secondary" onClick={() => updateUserRole(u.id, 'admin')} style={{fontSize:'0.7rem', padding:'4px 8px'}}>
                                      👑 Make Admin
                                    </button>
                                  )}
                                  {u.role === 'customer' && (
                                    <button className="btn btn-sm btn-secondary" onClick={() => updateUserRole(u.id, 'technician')} style={{fontSize:'0.7rem', padding:'4px 8px'}}>
                                      🛠️ Make Tech
                                    </button>
                                  )}
                                  {u.role === 'admin' && u.id !== user.id && (
                                    <button className="btn btn-sm btn-outline" onClick={() => updateUserRole(u.id, 'customer')} style={{fontSize:'0.7rem', padding:'4px 8px'}}>
                                      Remove Admin
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div style={{display:'flex', gap:8}}>
                                  <button 
                                    className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-primary'}`} 
                                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                                    style={{fontSize:'0.7rem', padding:'4px 8px'}}
                                  >
                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                  </button>
                                  {u.id !== user.id && (
                                    <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)} style={{fontSize:'0.7rem', padding:'4px 8px', background:'rgba(239, 68, 68, 0.1)', border:'1px solid var(--danger)', color:'var(--danger)'}}>
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="animate-fadeIn">
                <header className="admin-header-section">
                  <h1 className="admin-title">Platform Transactions</h1>
                  <p className="admin-subtitle">Tracking financial flow and M-Pesa settlements</p>
                </header>
                
                {loading ? renderSkeletonTable(8) : (
                  <div className="admin-table-container">
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Request</th><th>Customers/Techs</th><th>Amount</th><th>Status</th><th>Receipt</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                          {transactions.length > 0 ? transactions.map(tx => (
                            <tr key={tx.id}>
                              <td><strong>{tx.request_title || '—'}</strong></td>
                              <td>
                                <div style={{fontSize:'0.75rem'}}>
                                  <span style={{color:'var(--text-muted)'}}>C: </span>{tx.customer_name}<br/>
                                  <span style={{color:'var(--text-muted)'}}>T: </span>{tx.technician_name}
                                </div>
                              </td>
                              <td><strong style={{color:'var(--accent)'}}>KES {Number(tx.amount).toLocaleString()}</strong></td>
                              <td><span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>{tx.status}</span></td>
                              <td style={{fontFamily:'monospace', fontSize:'0.8rem'}}>{tx.mpesa_receipt || '—'}</td>
                              <td style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>{new Date(tx.created_at).toLocaleDateString()}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={7} style={{textAlign:'center', padding:48, color:'var(--text-muted)'}}>No transactions found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'disputes' && (
              <div className="animate-fadeIn">
                <header className="admin-header-section">
                  <h1 className="admin-title">Dispute Resolution</h1>
                  <p className="admin-subtitle">Mediating issues between users and technicians</p>
                </header>
                
                {loading ? (
                   <div className="disputes-list">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{height:180, borderRadius:20}} />)}
                   </div>
                ) : disputes.length > 0 ? (
                  <div className="disputes-list">
                    {disputes.map(d => (
                      <div key={d.id} className="card dispute-card">
                        <div className="dispute-header">
                          <div>
                            <h3 className="section-title" style={{fontSize:'1.3rem', background:'none', color:'inherit', webkitTextFillColor:'initial'}}>{d.request_title}</h3>
                            <p style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>
                              Raised by <span style={{color:'var(--text-primary)'}}>{d.raised_by_name}</span> • {new Date(d.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`badge ${d.status === 'open' ? 'badge-danger' : d.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span>
                        </div>
                        <div className="dispute-reason">{d.reason}</div>
                        {d.resolution && (
                          <div style={{background:'rgba(16,185,129,0.05)', padding:14, borderRadius:12, marginTop:12, border:'1px solid rgba(16,185,129,0.1)'}}>
                            <span style={{display:'block', fontSize:'0.75rem', color:'var(--success)', fontWeight:'700', textTransform:'uppercase', marginBottom:4}}>Resolution</span>
                            <p style={{fontSize:'0.9rem', color:'var(--text-primary)'}}>{d.resolution}</p>
                          </div>
                        )}
                        {d.status === 'open' && (
                          <button className="btn btn-sm btn-primary" style={{marginTop:16}} onClick={() => resolveDispute(d.id)}>Resolve Dispute</button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card-glass" style={{textAlign:'center', padding:'60px 20px'}}>
                    <p style={{color:'var(--text-muted)', fontSize:'1.1rem'}}>Everything is quiet. No active disputes.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
