// src/components/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer>
        <div className={styles.container}>
          <p>© 2025 FollicleScan AI Systems. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
    </footer>
  );
}

export default Footer;