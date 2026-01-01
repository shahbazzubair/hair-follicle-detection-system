import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import styles from './Login.module.css';

const Login = () => {
  const [role, setRole] = useState('patient'); // This tracks the SELECTED tab
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password
      });

      const { role: userRole, fullName } = response.data;

      // ROLE ENFORCEMENT LOGIC
      // Check if the role from DB matches the tab the user selected
      if (userRole !== role && userRole !== 'admin') {
        setLoading(false);
        return Swal.fire({
          icon: 'error',
          title: 'Role Mismatch',
          text: `This account is registered as a ${userRole}. Please use the ${userRole} tab to login.`,
          confirmButtonColor: '#ef4444'
        });
      }

      // Store session data
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userName', fullName);

      // Redirect based on verified role
      if (userRole === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (userRole === 'doctor') navigate('/doctor-dashboard', { replace: true });
      else navigate('/patient-dashboard', { replace: true });

    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || "Login failed.";

      if (status === 403) {
        Swal.fire({
          icon: 'info',
          title: 'Account Pending',
          text: detail,
          confirmButtonColor: '#2563eb'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: detail,
          confirmButtonColor: '#ef4444'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.roleToggle}>
          <button 
            type="button"
            className={role === 'patient' ? styles.activeTab : styles.tab} 
            onClick={() => setRole('patient')}
          >
            Patient
          </button>
          <button 
            type="button"
            className={role === 'doctor' ? styles.activeTab : styles.tab} 
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
        </div>

        <h2>{role === 'patient' ? 'Patient Login' : 'Doctor Login'}</h2>
        <p>Please enter your {role} credentials.</p>
        
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="email@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label>Password</label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Verifying...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;