import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Methodology.module.css';

export default function Methodology() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.methodologySection}>
        <div className={styles.header}>
          <h2 className={styles.mainTitle}>System Methodology</h2>
          <p className={styles.subTitle}>A refined, step-by-step operational guide for Patients and Clinical Staff.</p>
        </div>

        <div className={styles.container}>
          
          {/* --- PATIENT SECTION --- */}
          <div className={styles.roleBadgePatient}>Patient Workflow</div>
          
          <div className={styles.workflowGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>1. Secure Signup</h3>
                <p>Create your account. Passwords are enforced with high-level security protocols.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/PS.png" alt="Patient Signup" /></div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>2. Portal Login</h3>
                <p>Authenticate into the patient portal to access your private dashboard.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/PL.png" alt="Patient Login" /></div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>3. Specialist Routing</h3>
                <p>Select a verified clinical specialist to review your specific case.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/SS.png" alt="Select Specialist" /></div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>4. Data Ingestion</h3>
                <p>Upload a high-resolution image of the scalp for AI diagnostic processing.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/IU.png" alt="Upload Image" /></div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>5. Clinical Review</h3>
                <p>Access the generated AI analysis and verify the doctor's final notes.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/RA.png" alt="Report Analysis" /></div>
            </div>
          </div>

          {/* --- DOCTOR SECTION --- */}
          <div className={styles.roleBadgeDoctor}>Clinical Workflow</div>
          
          <div className={styles.workflowGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>1. Credential Submission</h3>
                <p>Register as a practitioner by uploading your official medical credentials.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/DS.png" alt="Doctor Signup" /></div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>2. System Verification</h3>
                <p>Administrators review and authorize your account for clinical access.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/AP.png" alt="Admin Approval" /></div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>3. Dashboard Access</h3>
                <p>Login to view the comprehensive queue of patients requiring review.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/DP.png" alt="Dashboard" /></div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>4. Direct AI Analysis</h3>
                <p>Bypass the queue to process local clinic images instantly via the dashboard.</p>
              </div>
              <div className={styles.stepVisual}><img src="src/assets/DA.png" alt="Direct Analysis" /></div>
            </div>
          </div>

          {/* --- BOTTOM ACTION --- */}
          <div className={styles.bottomAction}>
            <button onClick={() => navigate('/')} className={styles.backBtn}>
              ← Return to Home
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}