import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        
        {/* The Logo routes back to the home page */}
        <Link to="/" className={styles.logo}>
          HFD<span>AI</span>
        </Link>
          
        {/* The Authentication Buttons */}
        <div className={styles.authButtons}>
          <Link to="/login" className={styles.loginBtn}>Login</Link>
          <Link to="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>

      </div>
    </nav>
  );
}