'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './request.css';

export default function NewRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const technicianId = searchParams.get('technician') || '';

  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    technician_id: technicianId,
    service_id: '',
    title: '',
    description: '',
    location: '',
    budget: '',
    urgency: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
    fetchServices();
  }, [user]);

  const fetchServices = async () => {
    try {
      const data = await apiGet('/services');
      setServices(data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiPost('/requests', {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : null,
        technician_id: form.technician_id || null,
        service_id: form.service_id || null,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-page">
      <div className="container">
        <div className="request-container">
          <div className="request-card card animate-fadeInUp">
            <div className="request-header">
              <h1 className="request-title">Post a Service Request</h1>
              <p className="request-subtitle">Describe your problem and we'll match you with the right technician</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="request-form">
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select className="form-select" value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" className="form-input" placeholder="e.g., Leaking kitchen tap"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Describe the issue in detail..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required
                  rows={4} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" placeholder="e.g., Westlands, Nairobi"
                    value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget (KES)</label>
                  <input type="number" className="form-input" placeholder="e.g., 5000"
                    value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency</label>
                <div className="urgency-selector">
                  {['low', 'normal', 'urgent'].map((u) => (
                    <button type="button" key={u}
                      className={`urgency-option ${form.urgency === u ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, urgency: u })}>
                      {u === 'low' && '🟢'} {u === 'normal' && '🟡'} {u === 'urgent' && '🔴'} {u.charAt(0).toUpperCase() + u.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
