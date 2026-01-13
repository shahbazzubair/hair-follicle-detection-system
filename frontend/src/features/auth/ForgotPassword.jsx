import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calling backend
      const response = await axios.post('http://localhost:8000/api/auth/forgot-password', { email });
      
      if (response.data.status === 'success') {
        Swal.fire({
          title: "Email Sent!",
          text: "Please check your inbox for the reset link.",
          icon: "success",
          confirmButtonColor: "#2563eb"
        });
        setEmail('');
      }
    } catch (err) {
      // Specifically catch the "Not Found" error from backend
      if (err.response && err.response.status === 404) {
        Swal.fire({
          title: "Not Registered",
          text: err.response.data.detail,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: 'Go to Signup',
          confirmButtonColor: "#2563eb",
          cancelButtonText: 'Try Again'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/signup');
          }
        });
      } else {
        Swal.fire({
            title: "Error",
            text: "Could not connect to the server. Please try again later.",
            icon: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button onClick={() => navigate('/login')} className={styles.backBtn}>← Back to Login</button>
        <h2>Forgot Password?</h2>
        <p>Enter your email below. We will check our system and send you a link.</p>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your registered email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Checking System..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;