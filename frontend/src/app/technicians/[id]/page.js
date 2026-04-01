'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './technician.css';

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );
}

export default function TechnicianProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tech, setTech] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTechnician();
  }, [id]);

  const fetchTechnician = async () => {
    try {
      const data = await apiGet(`/technicians/${id}`);
      setTech(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="tech-profile-skeleton">
          <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '50%' }}></div>
          <div className="skeleton" style={{ width: 200, height: 28, marginTop: 16 }}></div>
          <div className="skeleton" style={{ width: 300, height: 16, marginTop: 8 }}></div>
        </div>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
        <h2>Technician not found</h2>
        <Link href="/search" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="tech-profile-page">
      <div className="container">
        <div className="tech-profile-layout">
          {/* Main Profile */}
          <div className="tech-profile-main">
            <div className="tech-profile-card card animate-fadeInUp">
              <div className="tech-profile-header">
                <div className="tech-profile-avatar">
                  {tech.avatar_url ? (
                    <img src={tech.avatar_url} alt={tech.name} />
                  ) : (
                    <span className="tech-avatar-fallback-lg">{tech.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="tech-profile-info">
                  <div className="tech-profile-name-row">
                    <h1 className="tech-profile-name">{tech.name}</h1>
                    {tech.is_verified && <span className="verified-badge-lg">✓ Verified</span>}
                  </div>
                  <p className="tech-profile-location">📍 {tech.location || 'Kenya'}</p>
                  <div className="tech-profile-rating">
                    <StarRating rating={tech.avg_rating || 0} />
                    <span>{tech.avg_rating ? Number(tech.avg_rating).toFixed(1) : 'New'} ({tech.total_reviews || 0} reviews)</span>
                  </div>
                  <div className="tech-profile-stats">
                    <div className="profile-stat">
                      <span className="profile-stat-value">{tech.years_experience || 0}</span>
                      <span className="profile-stat-label">Years Exp</span>
                    </div>
                    <div className="profile-stat">
                      <span className="profile-stat-value">{tech.total_jobs || 0}</span>
                      <span className="profile-stat-label">Jobs Done</span>
                    </div>
                    <div className="profile-stat">
                      <span className="profile-stat-value">{tech.total_reviews || 0}</span>
                      <span className="profile-stat-label">Reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              {tech.bio && (
                <div className="tech-profile-section">
                  <h3 className="section-label">About</h3>
                  <p className="tech-profile-bio">{tech.bio}</p>
                </div>
              )}

              <div className="tech-profile-section">
                <h3 className="section-label">Services</h3>
                <div className="tech-profile-services">
                  {(tech.services || []).map((s, i) => (
                    <div key={i} className="profile-service-item">
                      <span className="profile-service-icon">{s.icon}</span>
                      <div>
                        <span className="profile-service-name">{s.service_name}</span>
                        {s.price_from && (
                          <span className="profile-service-price">
                            KES {Number(s.price_from).toLocaleString()}
                            {s.price_to ? ` - ${Number(s.price_to).toLocaleString()}` : '+'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="tech-reviews card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <h3 className="section-label">Reviews ({tech.reviews?.length || 0})</h3>
              {(tech.reviews || []).length > 0 ? (
                <div className="reviews-list">
                  {tech.reviews.map((review, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <div className="review-author">
                          <div className="review-avatar">{review.reviewer_name?.charAt(0)}</div>
                          <div>
                            <span className="review-name">{review.reviewer_name}</span>
                            <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && <p className="review-text">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="tech-profile-sidebar">
            <div className="sidebar-card card-glass animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <h3 className="sidebar-title">Need this technician?</h3>
              <p className="sidebar-desc">Send a service request to {tech.name} directly</p>
              <Link
                href={user ? `/request/new?technician=${tech.id}` : '/login'}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                Request Service
              </Link>
              {tech.is_available ? (
                <span className="available-badge">🟢 Currently Available</span>
              ) : (
                <span className="unavailable-badge">🔴 Currently Unavailable</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
