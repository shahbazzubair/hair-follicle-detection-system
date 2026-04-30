import React from 'react';
import { Link } from 'react-router-dom'; // We must import Link!
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>© 2026 FollicleScan AI Systems. All rights reserved.</p>
        <div className={styles.legalLinks}>
          {/* Changed <a> tags to React <Link> tags */}
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}