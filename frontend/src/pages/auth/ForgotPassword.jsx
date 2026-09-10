import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/auth/forgot-password', { email: email.trim() });
      
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: res.data.message || 'A password reset link has been sent to your email. Please check your inbox.',
        confirmButtonColor: '#2563eb'
      });
      setEmail('');
    } catch (err) {
      if (err.response?.status === 404) {
        Swal.fire({ 
          title: "Not Registered", 
          text: err.response.data.detail || "This email is not registered.", 
          icon: "warning", 
          showCancelButton: true, 
          confirmButtonText: 'Go to Signup',
          confirmButtonColor: '#2563eb'
        }).then((r) => { 
          if (r.isConfirmed) navigate('/signup'); 
        });
      } else {
        const errorDetail = err.response?.data?.detail || "Could not send reset email. Please verify your email configuration.";
        Swal.fire('Error', errorDetail, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link to="/login" className={styles.backBtn}>
          <span className={styles.backArrow}>←</span> Back to Login
        </Link>

        <div className={styles.cardHeader}>
          <div className={styles.iconCircle}>🔐</div>
          <h2>Forgot Password?</h2>
          <p>Enter your registered email address and we will send you a secure link to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Registered Email Address</label>
            <input
              type="email"
              placeholder="e.g. doctor@hospital.com / user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <span>Remember your password?</span>
          <Link to="/login" className={styles.inlineLoginLink}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}