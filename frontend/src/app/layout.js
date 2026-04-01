import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'FindFix - Find Verified Technicians in Kenya',
  description: 'Kenya\'s trusted marketplace connecting you with verified technicians for plumbing, electrical, carpentry, and more. Get expert help fast with M-Pesa payments.',
  keywords: 'technicians, Kenya, plumber, electrician, handyman, repair, M-Pesa, FindFix',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: '72px', minHeight: 'calc(100vh - 72px)' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
