import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css'; // Reuse Login styles for consistency

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for sending recovery email (FR-3) goes here
    setSubmitted(true);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Reset Password</h2>
        {!submitted ? (
          <>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input type="email" placeholder="email@example.com" required />
              </div>
              <button type="submit" className={styles.submitBtn}>
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successMessage}>
            <p>✅ A reset link has been sent to your email. Please check your inbox.</p>
          </div>
        )}
        
        <p className={styles.switchAuth}>
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;