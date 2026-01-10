import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword'; // ADD THIS IMPORT
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard'; 
import Methodology from './pages/Methodology';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isPatientDashboard = location.pathname === '/patient-dashboard';
  const isDoctorDashboard = location.pathname === '/doctor-dashboard'; 
  const isAdminPath = location.pathname === '/admin' || location.pathname === '/admin-dashboard';
  const isMethodology = location.pathname === '/methodology';
  
  const hideShell = isPatientDashboard || isDoctorDashboard || isAdminPath || isMethodology;

  return (
    <div className="app-shell">
      {!hideShell && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* ADD THIS ROUTE: :token is a dynamic parameter */}
          <Route path="/reset-password/:token" element={<ResetPassword />} /> 
          
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          
          <Route path="/patient-dashboard" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideShell && <Footer />}
    </div>
  );
}

function App() { return ( <Router><AppContent /></Router> ); }
export default App;