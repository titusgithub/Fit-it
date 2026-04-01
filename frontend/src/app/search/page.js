'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import './search.css';

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    service: searchParams.get('service') || '',
    location: searchParams.get('location') || '',
    search: '',
  });

  useEffect(() => {
    fetchServices();
    fetchTechnicians();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await apiGet('/services');
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.service) params.set('service', filters.service);
      if (filters.location) params.set('location', filters.location);
      if (filters.search) params.set('search', filters.search);
      params.set('verified', 'true');

      const data = await apiGet(`/technicians?${params.toString()}`);
      setTechnicians(data.technicians || []);
    } catch (err) {
      console.error(err);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTechnicians();
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header animate-fadeInUp">
          <h1 className="search-title">Find Technicians</h1>
          <p className="search-subtitle">Browse verified professionals near you</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="search-filters card animate-fadeInUp">
          <div className="filter-row">
            <div className="filter-field">
              <label className="form-label">Service Type</label>
              <select
                className="form-select"
                value={filters.service}
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.name}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Nairobi, Mombasa"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary filter-btn">Search</button>
          </div>
        </form>

        {/* Results */}
        <div className="search-results">
          {loading ? (
            <div className="results-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="tech-card-skeleton card">
                  <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 16 }}></div>
                  <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 8 }}></div>
                  <div className="skeleton" style={{ width: '80%', height: 14, marginBottom: 8 }}></div>
                  <div className="skeleton" style={{ width: '40%', height: 14 }}></div>
                </div>
              ))}
            </div>
          ) : technicians.length > 0 ? (
            <>
              <p className="results-count">{technicians.length} technician{technicians.length > 1 ? 's' : ''} found</p>
              <div className="results-grid">
                {technicians.map((tech) => (
                  <Link key={tech.id} href={`/technicians/${tech.id}`} className="tech-card card">
                    <div className="tech-card-header">
                      <div className="tech-avatar">
                        {tech.avatar_url ? (
                          <img src={tech.avatar_url} alt={tech.name} />
                        ) : (
                          <span className="tech-avatar-fallback">{tech.name?.charAt(0)}</span>
                        )}
                      </div>
                      {tech.is_verified && <span className="verified-badge" title="Verified">✓</span>}
                    </div>
                    <h3 className="tech-name">{tech.name}</h3>
                    <p className="tech-location">📍 {tech.location || 'Kenya'}</p>
                    <div className="tech-rating">
                      <StarRating rating={tech.avg_rating || 0} />
                      <span className="tech-rating-text">
                        {tech.avg_rating ? `${Number(tech.avg_rating).toFixed(1)}` : 'New'} ({tech.total_reviews || 0} reviews)
                      </span>
                    </div>
                    {tech.bio && <p className="tech-bio">{tech.bio.slice(0, 100)}{tech.bio.length > 100 ? '...' : ''}</p>}
                    <div className="tech-services">
                      {(tech.services || []).slice(0, 3).map((s, i) => (
                        <span key={i} className="tech-service-tag">{s.icon} {s.service_name}</span>
                      ))}
                      {(tech.services || []).length > 3 && (
                        <span className="tech-service-more">+{tech.services.length - 3} more</span>
                      )}
                    </div>
                    <div className="tech-meta">
                      <span>{tech.years_experience || 0} yrs exp</span>
                      <span>{tech.total_jobs || 0} jobs done</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No technicians found</h3>
              <p>Try adjusting your search filters or check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
