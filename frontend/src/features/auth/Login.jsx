import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [role, setRole] = useState('patient');

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Role Selection Toggles */}
        <div className={styles.roleToggle}>
          <button 
            className={role === 'patient' ? styles.activeTab : styles.tab} 
            onClick={() => setRole('patient')}
          >
            Patient
          </button>
          <button 
            className={role === 'doctor' ? styles.activeTab : styles.tab} 
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
        </div>

        <h2>{role === 'patient' ? 'Patient Login' : 'Doctor Login'}</h2>
        <p>Welcome back! Please enter your credentials.</p>
        
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" placeholder="email@example.com" required />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label>Password</label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot?</Link>
            </div>
            <input type="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
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