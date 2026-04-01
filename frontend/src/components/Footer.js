import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <span className="brand-icon">🔧</span>
              <span className="brand-text">Find<span className="brand-accent">Fix</span></span>
            </Link>
            <p className="footer-desc">
              Kenya's trusted marketplace connecting you with verified technicians for all your home and business needs.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Services</h4>
            <Link href="/search?service=Plumbing" className="footer-link">Plumbing</Link>
            <Link href="/search?service=Electrical" className="footer-link">Electrical</Link>
            <Link href="/search?service=Carpentry" className="footer-link">Carpentry</Link>
            <Link href="/search?service=Appliance Repair" className="footer-link">Appliance Repair</Link>
            <Link href="/search?service=Cleaning" className="footer-link">Cleaning</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Company</h4>
            <Link href="/about" className="footer-link">About Us</Link>
            <Link href="/register?role=technician" className="footer-link">Become a Technician</Link>
            <Link href="/search" className="footer-link">Find a Technician</Link>
            <Link href="/request/new" className="footer-link">Post a Request</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Support</h4>
            <Link href="/help" className="footer-link">Help Center</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/contact" className="footer-link">Contact Us</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FindFix. All rights reserved.</p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Twitter">𝕏</a>
            <a href="#" className="social-link" aria-label="Facebook">f</a>
            <a href="#" className="social-link" aria-label="Instagram">📷</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
