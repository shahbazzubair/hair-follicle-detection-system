import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.jpg';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandRow}>
          <img src={logoImg} alt="HFD AI Logo" className={styles.footerLogoImg} />
          <p>© 2026 HFD AI Trichology Systems. All rights reserved.</p>
        </div>
        <div className={styles.legalLinks}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}