import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Methodology.module.css';

const Methodology = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.manualWrapper}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backBtn}>← Back to Home</button>
        <h1>System User Manual</h1>
        <p>A simple step-by-step guide to using the HFDAI platform.</p>
      </header>

      <div className={styles.container}>
        {/* PATIENT SECTION */}
        <section className={styles.section}>
          <div className={styles.roleBadge}>For Patients</div>
          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <div className={styles.stepHeader}>
                <span className={styles.number}>01</span>
                <h3>Create Account</h3>
              </div>
              <p>Sign up as a "Patient". Enter your name, email, and phone. Once registered, log in to access your portal.</p>
            </div>
            <div className={styles.stepVisual}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
              </svg>
              <span>[Screenshot: Registration Page]</span>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <div className={styles.stepHeader}>
                <span className={styles.number}>02</span>
                <h3>Upload Scalp Image</h3>
              </div>
              <p>Select a verified doctor from your dashboard and upload a clear scalp photo for AI follicle analysis.</p>
            </div>
            <div className={styles.stepVisual}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>[Screenshot: Patient Dashboard Upload Area]</span>
            </div>
          </div>
        </section>

        {/* DOCTOR SECTION */}
        <section className={styles.section}>
          <div className={styles.roleBadgeDoctor}>For Doctors</div>
          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <div className={styles.stepHeader}>
                <span className={styles.number}>01</span>
                <h3>Expert Registration</h3>
              </div>
              <p>Register as a "Doctor" and upload your medical degree. Wait for Admin approval (usually within 24 hours).</p>
            </div>
            <div className={styles.stepVisual}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>[Screenshot: Doctor Signup Page]</span>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <div className={styles.stepHeader}>
                <span className={styles.number}>02</span>
                <h3>Patient Consultation</h3>
              </div>
              <p>Access patient scans from your dashboard to provide clinical reviews and growth tracking results.</p>
            </div>
            <div className={styles.stepVisual}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <span>[Screenshot: Doctor Patient Queue]</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Methodology;