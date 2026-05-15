import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ScrollToTop from './components/ScrollToTop';

// --- Layout Components ---
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// --- Landing Page ---
import Hero from './pages/landing_page/Hero';
import Testimonials from './pages/landing_page/Testimonials';
import Methodology from './pages/landing_page/Methodology';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// --- Authentication ---
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// --- Admin Portal ---
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// --- Dashboards ---
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';

export default function App() {
  return (
    <Router>

      {/* AUTO SCROLL TO TOP */}
      <ScrollToTop />

      <Routes>

        {/* === PORTALS & DASHBOARDS === */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

        {/* === MAIN WEBSITE === */}
        <Route
          path="/*"
          element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />

              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<><Hero /><Testimonials /></>} />
                  <Route path="/methodology" element={<Methodology />} />

                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Legal */}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </main>

              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}