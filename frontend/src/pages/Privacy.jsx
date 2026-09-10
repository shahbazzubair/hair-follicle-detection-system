import React, { useEffect } from 'react';
import styles from './Privacy.module.css';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Medical Data Governance</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            How the Hair Follicle Detection System (HFD AI) collects, protects, processes, and respects your clinical data and privacy.
          </p>
          <div className={styles.metaInfo}>
            <span>Effective Date: September 2026</span>
            <span>•</span>
            <span>Version: 2.4 (Clinical AI Edition)</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>1</span>
              Scope & Platform Purpose
            </h2>
            <p className={styles.sectionText}>
              The Hair Follicle Detection System ("HFD AI", "we", "our") is a clinical-assistive AI diagnostic platform engineered to analyze scalp trichoscopy imagery and grade androgenetic alopecia across the standardized Norwood-Hamilton scale.
            </p>
            <p className={styles.sectionText}>
              This Privacy Policy governs the processing of personal data, medical registration credentials, scalp micrograph scans, and generated clinical diagnostic reports across our patient, physician, and administrative portals.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>2</span>
              Information We Collect
            </h2>
            <div className={styles.gridTwo}>
              <div className={styles.subCard}>
                <h4>Patient Information</h4>
                <p>Full name, email address, phone number, encrypted account credentials, historical scalp scans, and diagnosed clinical reports.</p>
              </div>
              <div className={styles.subCard}>
                <h4>Physician & Specialist Data</h4>
                <p>Full name, medical specialization, contact details, certified medical degrees/licenses, and clinical consultation records.</p>
              </div>
            </div>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Trichoscopy & Scalp Scans:</strong> High-resolution optical micrographs uploaded for follicular density and miniaturization grading.
              </li>
              <li className={styles.listItem}>
                <strong>Diagnostic Metadata:</strong> Quantitative follicular metrics, predicted Norwood stage, severity scores, and digital timestamp verification.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>3</span>
              How AI Processes Your Data
            </h2>
            <p className={styles.sectionText}>
              Our AI engine utilizes state-of-the-art <strong>Vision Transformers (ViT)</strong> to analyze image patches for follicular unit density, terminal-to-vellus ratios, and scalp boundary patterns.
            </p>
            <div className={styles.highlightBox}>
              <p className={styles.highlightText}>
                <strong>Zero Unconsented AI Training:</strong> Your uploaded personal medical scans are processed strictly for your individual diagnostic report. We never sell, distribute, or expose your medical records to third-party advertising networks.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>4</span>
              Doctor-Patient Confidentiality
            </h2>
            <p className={styles.sectionText}>
              Access to a patient's scan history and clinical reports is strictly restricted to:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>The patient who uploaded the diagnostic scan.</li>
              <li className={styles.listItem}>The licensed consulting dermatologist or trichologist explicitly selected by the patient.</li>
              <li className={styles.listItem}>Authorized clinical administrators verifying medical credentials.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>5</span>
              Security & Encryption Architecture
            </h2>
            <p className={styles.sectionText}>
              We employ enterprise-grade security standards to protect healthcare data:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Authentication:</strong> JSON Web Tokens (JWT) with secure time-limited expiration and password hashing.</li>
              <li className={styles.listItem}><strong>Data Transmission:</strong> End-to-end SSL/TLS 256-bit encrypted data transfer between browser and backend servers.</li>
              <li className={styles.listItem}><strong>Storage Protection:</strong> Isolated directory partitioning for clinical records and medical degree verification documents.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>6</span>
              Your Rights & Data Portability
            </h2>
            <p className={styles.sectionText}>
              Under international healthcare privacy frameworks, you retain full rights over your data:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Report Export:</strong> Download official, hospital-grade PDF diagnostic reports at any time.</li>
              <li className={styles.listItem}><strong>Data Deletion:</strong> Request permanent erasure of historical scans and profile records.</li>
              <li className={styles.listItem}><strong>Account Control:</strong> Update personal contact information or password credentials directly from your dashboard.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>7</span>
              Contact Data Protection Desk
            </h2>
            <p className={styles.sectionText}>
              If you have any questions regarding your medical data or wish to exercise data privacy rights, please contact our Data Governance Officer at <strong>privacy@hfd-ai.org</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}