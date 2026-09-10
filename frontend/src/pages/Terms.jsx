import React, { useEffect } from 'react';
import styles from './Terms.module.css';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Platform Terms & Conditions</span>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>
            Please read these terms carefully before using the Hair Follicle Detection System (HFD AI).
          </p>
          <div className={styles.metaInfo}>
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Applicable to: Patients, Specialists & Administrators</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>1</span>
              Acceptance of Terms
            </h2>
            <p className={styles.sectionText}>
              By accessing, creating an account on, or interacting with the Hair Follicle Detection Platform ("HFD AI"), you confirm your agreement to abide by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must discontinue platform use immediately.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>2</span>
              Clinical Diagnostic & AI Disclaimer
            </h2>
            <div className={styles.disclaimerBox}>
              <div className={styles.disclaimerTitle}>
                ⚠️ Medical & Diagnostic Notice
              </div>
              <p className={styles.disclaimerText}>
                HFD AI utilizes advanced Computer Vision and Vision Transformer (ViT) algorithms as an <strong>assistive diagnostic clinical tool</strong>. It is designed to assist certified medical practitioners and provide patient educational insights. AI outputs do not replace an in-person clinical biopsy or final medical diagnosis by a licensed dermatologist.
              </p>
            </div>
            <p className={styles.sectionText}>
              Patients must not initiate, alter, or terminate prescription medications (such as oral 5-alpha reductase inhibitors) without consulting a licensed physician.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>3</span>
              Medical Specialist Credentialing & Verification
            </h2>
            <p className={styles.sectionText}>
              Physicians and trichologists registering on HFD AI must provide verifiable clinical credentials:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Specialists must upload legitimate medical degree certificates, licenses, and verified contact information.</li>
              <li className={styles.listItem}>All doctor accounts undergo mandatory administrative verification before portal activation.</li>
              <li className={styles.listItem}>Misrepresentation of medical authority or submitting fraudulent credentials will result in immediate termination and reporting to regulatory authorities.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>4</span>
              User Responsibilities & Upload Guidelines
            </h2>
            <p className={styles.sectionText}>
              To ensure optimal AI diagnostic accuracy and platform integrity:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Uploaded scalp images must be clear, properly illuminated, and focused on the crown, hairline, or vertex zones.</li>
              <li className={styles.listItem}>Users agree not to upload non-scalp imagery, corrupted binaries, or offensive media.</li>
              <li className={styles.listItem}>Users are responsible for maintaining the confidentiality of their login credentials.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>5</span>
              Intellectual Property Rights
            </h2>
            <p className={styles.sectionText}>
              All intellectual property rights in the HFD AI platform—including the Vision Transformer architecture integration, user interface designs, custom PDF generation algorithms, and branding—are owned exclusively by the HFD AI Project Team.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>6</span>
              Limitation of Liability
            </h2>
            <p className={styles.sectionText}>
              HFD AI and its developers shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime, image misinterpretation due to poor lighting, or self-administered treatments without professional supervision.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>7</span>
              Modifications to Terms
            </h2>
            <p className={styles.sectionText}>
              We reserve the right to modify these Terms of Service to reflect system updates or legal compliance. Continued use of the platform constitutes acceptance of revised terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}