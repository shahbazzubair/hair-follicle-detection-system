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
        <p>Step-by-step operational guide for Patients and Doctors.</p>
      </header>

      <div className={styles.container}>
        
        {/* --- PATIENT SECTION --- */}
        <div className={styles.roleHeader}>Patient Methodology</div>
        
        <section className={styles.section}>
          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 1: Sign Up</h3>
              <p>Create your account by providing your details. Ensure your password meets the strict 8-character security policy.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/PS.png" alt="Signup" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 2: Login</h3>
              <p>Use your registered email and password to access the patient portal safely.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/PL.png" alt="Login" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 3: Select Specialist</h3>
              <p>Browse the list of verified doctors and select one. This routes your upcoming analysis to that specific professional.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/SS.png" alt="Select Doctor" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 4: Image Upload</h3>
              <p>Upload a high-resolution image of your scalp for the Synapse AI to process follicle density.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/IU.png" alt="Upload Image" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 5: Report Analysis</h3>
              <p>Navigate to the 'Report Analysis' tab to view your processed AI results and doctor's feedback.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/RA.png" alt="Report Analysis" /></div>
          </div>
        </section>

        {/* --- DOCTOR SECTION --- */}
        <div className={styles.roleHeaderDoctor}>Doctor Methodology</div>
        
        <section className={styles.section}>
          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 1: Sign Up</h3>
              <p>Register as a doctor by uploading your medical degree for verification.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/DS.png" alt="Doctor Signup" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 2: Admin Approval</h3>
              <p>Wait for the system administrator to verify your credentials. Your account remains "Pending" until approved.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/AP.png" alt="Admin Approval" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 3: Login</h3>
              <p>Once approved, log in to access your dashboard and patient data.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/DL.png" alt="Doctor Login" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 4: Patient Dashboard</h3>
              <p>View a comprehensive list of all patients who have selected you for consultation.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/DP.png" alt="Dashboard" /></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Step 5: Direct Analysis</h3>
              <p>Use the 'Direct Analysis' tool to upload a scalp image and generate a report instantly for clinical use.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/DA.png" alt="Direct Analysis" /></div>
          </div>
        </section>

        {/* --- COMMON SUPPORT --- */}
        <div className={styles.roleHeaderSupport}>Support</div>
        <section className={styles.section}>
          <div className={styles.step}>
            <div className={styles.stepInfo}>
              <h3>Password Reset</h3>
              <p>If you forget your password, use the reset link to receive a secure token via email to update your credentials.</p>
            </div>
            <div className={styles.stepVisual}><img src="/assets/FP.png" alt="Password Reset" /></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Methodology;