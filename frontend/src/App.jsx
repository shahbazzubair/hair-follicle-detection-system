import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPassword from './features/auth/ForgotPassword';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard'; // NEW: Import Doctor Dashboard
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

/**
 * AppContent handles the conditional rendering and route safety logic.
 */
function AppContent() {
  const location = useLocation();
  
  // Logic to hide common UI elements for dashboards and admin area
  const isPatientDashboard = location.pathname === '/patient-dashboard';
  const isDoctorDashboard = location.pathname === '/doctor-dashboard'; // NEW: Check for Doctor Dashboard
  const isAdminPath = location.pathname === '/admin' || location.pathname === '/admin-dashboard';
  
  // Update hideShell to include the Doctor Dashboard
  const hideShell = isPatientDashboard || isDoctorDashboard || isAdminPath;

  return (
    <div className="app-shell">
      {/* Navbar is hidden on all dashboard/admin paths for a clean workspace */}
      {!hideShell && <Navbar />}
      
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Secret Admin Entry */}
          <Route path="/admin" element={<AdminLoginPage />} />
          
          {/* Protected Routes */}
          {/* Patient Access only */}
          <Route 
            path="/patient-dashboard" 
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Doctor Access only (requires Admin Verification) */}
          <Route 
            path="/doctor-dashboard" 
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Access only */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* CATCH-ALL REDIRECT */}
          {/* If the user types any invalid URL, they are sent back to the Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer is hidden on all dashboard/admin paths */}
      {!hideShell && <Footer />}
    </div>
  );
}

/**
 * Main App component wrapped in Router
 */
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;