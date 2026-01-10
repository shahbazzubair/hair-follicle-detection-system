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
      // Send request to your FastAPI backend
      const response = await axios.post('http://localhost:8000/api/auth/forgot-password', { email });
      
      if (response.data.status === 'success') {
        Swal.fire({
          title: "Email Sent!",
          text: "If this email is registered, you will receive a reset link shortly.",
          icon: "success",
          confirmButtonColor: "#2563eb"
        });
        setEmail('');
      }
    } catch (err) {
      Swal.fire("Error", "Could not connect to the server. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button onClick={() => navigate('/login')} className={styles.backBtn}>← Back to Login</button>
        <h2>Forgot Password?</h2>
        <p>No worries! Enter your email below and we will send you a link to reset your password.</p>
        
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
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;