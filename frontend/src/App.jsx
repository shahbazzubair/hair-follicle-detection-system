import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

// --- Authentication (Clean Architecture) ---
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
      <Routes>
        
        {/* === PORTALS & DASHBOARDS (No Global Navbar/Footer) === */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

        {/* === MAIN WEBSITE & AUTH (With Navbar/Footer) === */}
        <Route path="/*" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Landing Page (Clean & Short) */}
                <Route path="/" element={<><Hero /><Testimonials /></>} />
                
                {/* Dedicated Standalone Methodology Page */}
                <Route path="/methodology" element={<Methodology />} />
                
                {/* Authentication Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Legal & Contact */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />

      </Routes>
    </Router>
  );
}