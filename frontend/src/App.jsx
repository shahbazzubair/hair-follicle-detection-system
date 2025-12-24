import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './features/auth/ForgotPassword';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={<Home />} />
            
            {/* Authentication Route (FR-1)  */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Placeholder for Login (FR-2)  */}
            <Route path="/login" element={<div className="page-placeholder"><h2>Login Coming Soon</h2></div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;