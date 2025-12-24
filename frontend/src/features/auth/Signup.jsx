import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Signup.module.css';

const Signup = () => {
  // State to track if the user is a Patient or Doctor
  const [role, setRole] = useState('patient');

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* 1. Role Selection Toggles at the top */}
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

        <h2>{role === 'patient' ? 'Patient Sign Up' : 'Doctor Sign Up'}</h2>
        <p>Enter your details to create an account</p>
        
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" required />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" placeholder="example@email.com" required />
          </div>

          {/* New Contact Number Field */}
          <div className={styles.inputGroup}>
            <label>Contact Number</label>
            <input type="tel" placeholder="+92 300 1234567" required />
          </div>

          {/* DYNAMIC DOCTOR FIELDS: Only show if role is 'doctor' */}
          {role === 'doctor' && (
            <>
              <div className={styles.inputGroup}>
                <label>Specialization</label>
                <input type="text" placeholder="e.g. Dermatologist" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Upload Degree (Image)</label>
                <input type="file" accept="image/*" required className={styles.fileInput} />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
          </button>
        </form>

        <p className={styles.switchAuth}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;