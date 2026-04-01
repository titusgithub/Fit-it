'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './page.css';

const SERVICES = [
  { name: 'Plumbing', icon: '🔧', desc: 'Pipes, taps & water systems' },
  { name: 'Electrical', icon: '⚡', desc: 'Wiring & electrical repairs' },
  { name: 'Carpentry', icon: '🪚', desc: 'Furniture & woodwork' },
  { name: 'Painting', icon: '🎨', desc: 'Interior & exterior painting' },
  { name: 'Appliance Repair', icon: '📺', desc: 'TVs, fridges & electronics' },
  { name: 'Phone Repair', icon: '📱', desc: 'Screens & phone fixes' },
  { name: 'AC & Refrigeration', icon: '❄️', desc: 'Cooling systems' },
  { name: 'Cleaning', icon: '🧹', desc: 'Deep cleaning services' },
  { name: 'CCTV Installation', icon: '📹', desc: 'Security cameras' },
  { name: 'Locksmith', icon: '🔐', desc: 'Locks & security' },
  { name: 'Roofing', icon: '🏠', desc: 'Roof repair & installation' },
  { name: 'Welding', icon: '🔥', desc: 'Metal fabrication' },
];

const STATS = [
  { number: '2,500+', label: 'Verified Technicians' },
  { number: '15,000+', label: 'Jobs Completed' },
  { number: '4.8★', label: 'Average Rating' },
  { number: '47', label: 'Counties Covered' },
];

const STEPS = [
  { step: '01', title: 'Search', desc: 'Find the right technician by service type and your location across Kenya.', icon: '🔍' },
  { step: '02', title: 'Request', desc: 'Describe your problem, set a budget, and post your service request.', icon: '📝' },
  { step: '03', title: 'Connect', desc: 'Chat directly with technicians, compare quotes, and choose the best fit.', icon: '💬' },
  { step: '04', title: 'Pay Securely', desc: 'Pay via M-Pesa only when the job is done to your satisfaction.', icon: '💰' },
];

export default function HomePage() {
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [visibleStats, setVisibleStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisibleStats(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-grid-pattern"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge animate-fadeInUp">🇰🇪 Kenya's #1 Technician Marketplace</span>
            <h1 className="hero-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              Find Verified <span className="hero-highlight">Technicians</span> Near You
            </h1>
            <p className="hero-subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              From plumbing to electronics — connect with skilled, verified professionals. Pay securely with M-Pesa.
            </p>

            <div className="hero-search animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="search-field">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-field">
                <span className="search-icon">📍</span>
                <input
                  type="text"
                  placeholder="Your location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="search-input"
                />
              </div>
              <Link
                href={`/search?service=${searchService}&location=${searchLocation}`}
                className="btn btn-primary btn-lg search-btn"
              >
                Search
              </Link>
            </div>

            <div className="hero-tags animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <span className="hero-tag-label">Popular:</span>
              {['Plumbing', 'Electrical', 'Phone Repair', 'Cleaning'].map((s) => (
                <Link key={s} href={`/search?service=${s}`} className="hero-tag">{s}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <div key={i} className={`stat-card ${visibleStats ? 'visible' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Browse through our wide range of professional services available across Kenya</p>
          </div>
          <div className="services-grid">
            {SERVICES.map((service, i) => (
              <Link key={i} href={`/search?service=${service.name}`} className="service-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="service-icon">{service.icon}</span>
                <h3 className="service-name">{service.name}</h3>
                <p className="service-desc">{service.desc}</p>
                <span className="service-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Getting your problems fixed is as easy as 1-2-3-4</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((item, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{item.step}</div>
                <span className="step-icon">{item.icon}</span>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card card-glass">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">Join thousands of satisfied customers and verified technicians on FindFix</p>
            <div className="cta-buttons">
              <Link href="/register" className="btn btn-primary btn-lg">Find a Technician</Link>
              <Link href="/register?role=technician" className="btn btn-outline btn-lg">Join as Technician</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
