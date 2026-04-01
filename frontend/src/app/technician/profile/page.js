'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function TechnicianProfileEdit() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [techServices, setTechServices] = useState([]);
  const [form, setForm] = useState({ bio: '', location: '', years_experience: '', id_number: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'technician') { router.push('/'); return; }
    fetchProfile();
    fetchServices();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await apiGet('/auth/me');
      if (data.technician) {
        setForm({
          bio: data.technician.bio || '',
          location: data.technician.location || '',
          years_experience: data.technician.years_experience || '',
          id_number: data.technician.id_number || '',
        });
      }
    } catch (err) { console.error(err); }
  };

  const fetchServices = async () => {
    try {
      const data = await apiGet('/services');
      setServices(data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await apiPost('/technicians/profile', {
        ...form,
        years_experience: parseInt(form.years_experience) || 0,
      });
      setSuccess('Profile updated successfully!');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const addService = async (serviceId) => {
    const priceFrom = prompt('Minimum price (KES):');
    const priceTo = prompt('Maximum price (KES):');
    try {
      await apiPost('/technicians/services', {
        service_id: serviceId,
        price_from: parseFloat(priceFrom) || 0,
        price_to: parseFloat(priceTo) || 0,
      });
      alert('Service added!');
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="card animate-fadeInUp">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Edit Profile</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Complete your profile to start receiving jobs</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, color: 'var(--success)', fontSize: '0.88rem' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Bio / About</label>
              <textarea className="form-textarea" placeholder="Tell customers about your skills and experience..."
                value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="e.g., Nairobi" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input type="number" className="form-input" placeholder="e.g., 5" value={form.years_experience}
                  onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">ID Number (for verification)</label>
              <input className="form-input" placeholder="National ID number" value={form.id_number}
                onChange={(e) => setForm({ ...form, id_number: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Add Services</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {services.map(s => (
                <button key={s.id} className="btn btn-sm btn-secondary" onClick={() => addService(s.id)}>
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
