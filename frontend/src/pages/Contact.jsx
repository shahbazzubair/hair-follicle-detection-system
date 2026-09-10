import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from './Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Patient',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate clinical ticket submission
    setTimeout(() => {
      setSubmitting(false);
      Swal.fire({
        icon: 'success',
        title: 'Message Dispatched!',
        text: 'Thank you for reaching out. Our clinical support team will review your inquiry and respond within 24 hours.',
        confirmButtonColor: '#0284c7'
      });
      setFormData({
        name: '',
        email: '',
        role: 'Patient',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Get In Touch</span>
          <h1 className={styles.title}>Contact & Support Desk</h1>
          <p className={styles.subtitle}>
            Have questions about AI scan analysis, doctor verification, or technical research? Our dedicated team is here to help.
          </p>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column: Direct Channels */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🔬</div>
              <h3>Clinical Diagnostics Desk</h3>
              <p>For inquiries regarding scalp trichoscopy analysis, PDF report interpretation, and patient cases.</p>
              <a href="mailto:clinical@hfd-ai.org">clinical@hfd-ai.org</a>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🩺</div>
              <h3>Specialist & Doctor Onboarding</h3>
              <p>For trichologists and dermatologists seeking institutional verification or portal registration.</p>
              <a href="mailto:doctors@hfd-ai.org">doctors@hfd-ai.org</a>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⚡</div>
              <h3>Technical & Research Support</h3>
              <p>For algorithmic inquiries, Vision Transformer architecture questions, and dataset collaborations.</p>
              <a href="mailto:research@hfd-ai.org">research@hfd-ai.org</a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className={styles.formCard}>
            <h2>Send Us a Direct Message</h2>
            <p>Fill out the form below and our medical support staff will reach out to you.</p>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Your Full Name</label>
                <input
                  type="text"
                  name="name"
                  className={styles.formInput}
                  placeholder="e.g. Dr. Shahbaz / Muhammad"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={styles.formInput}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Your Role / Inquirer Type</label>
                <select
                  name="role"
                  className={styles.formSelect}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Patient">Patient / Individual</option>
                  <option value="Dermatologist">Practicing Dermatologist / Trichologist</option>
                  <option value="Researcher">Academic Researcher / Student</option>
                  <option value="Partner">Clinical Partner / Institution</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  className={styles.formInput}
                  placeholder="e.g. Question about Norwood Stage 3 Analysis"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Message</label>
                <textarea
                  name="message"
                  className={styles.formTextarea}
                  placeholder="Describe your question or feedback in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Dispatching Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <h2 className={faqTitle => styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>How accurate is the AI diagnostic model?</h4>
              <p>Our fine-tuned Vision Transformer (ViT-Base-Patch16) model achieves 92.99% test accuracy across 7 Norwood stages, validated on strictly unseen clinical scan groups.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>How do doctors get verified on the platform?</h4>
              <p>Specialists upload their medical degrees and licensing certificates upon signup. Our administrative board verifies the credentials before activating full clinical access.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>Are patient scans and reports private?</h4>
              <p>Yes. All scan uploads and clinical PDF reports are protected with strict access control and are only accessible by the patient and their assigned consulting doctor.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>How do I download my official clinical report?</h4>
              <p>Once a scan is processed, you can download a hospital-grade, digitally signed A4 PDF report directly from the Patient or Doctor dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}