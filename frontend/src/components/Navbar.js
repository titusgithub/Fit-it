'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'technician') return '/technician/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link href="/" className="navbar-brand">
          <span className="brand-icon">🔧</span>
          <span className="brand-text">Find<span className="brand-accent">Fix</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <Link href="/search" className="nav-link" onClick={() => setMenuOpen(false)}>Find Technicians</Link>
          <Link href="/request/new" className="nav-link" onClick={() => setMenuOpen(false)}>Post Request</Link>
          {user ? (
            <>
              <Link href={getDashboardLink()} className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <div className="nav-user">
                <span className="nav-user-name">{user.name}</span>
                <span className="nav-user-role badge badge-accent">{user.role}</span>
                <button className="btn btn-sm btn-secondary" onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link href="/login" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}
