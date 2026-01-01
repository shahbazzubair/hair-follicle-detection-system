import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './PatientDashboard.module.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userName) {
      navigate('/login', { replace: true });
      return;
    }
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/doctors/list');
        setDoctors(response.data);
      } catch (err) {
        console.error("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, [userName, navigate]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedDoctor) {
      Swal.fire("Selection Required", "Please select a specialist before uploading.", "warning");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("patientName", userName);
    formData.append("doctorId", selectedDoctor);
    formData.append("image", file);

    try {
      await axios.post('http://localhost:8000/api/analysis/upload', formData);
      Swal.fire("Success", "Scan sent to Dr. " + selectedDoctor, "success");
    } catch (err) {
      Swal.fire("Upload Failed", "Could not send scan to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.dashboardWrapper}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logoText}>HairCare<span>AI</span></h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{userName?.charAt(0)}</div>
            <div className={styles.userMeta}>
              <span className={styles.welcomeLabel}>Patient Portal</span>
              <span className={styles.actualName}>{userName}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.welcomeHero}>
          <h2>Hello, {userName}! 👋</h2>
          <p>Select a specialist and upload your scan for analysis.</p>
        </div>

        <div className={styles.gridContainer}>
          {/* Section 1: Doctor Selection */}
          <section className={styles.dashboardCard}>
            <h3>👨‍⚕️ Select Specialist</h3>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className={styles.elegantSelect}
            >
              <option value="">-- Choose Specialist --</option>
              {doctors.map((doc, idx) => (
                <option key={idx} value={doc.fullName}>Dr. {doc.fullName}</option>
              ))}
            </select>
          </section>

          {/* Section 2: Upload Area */}
          <section className={`${styles.dashboardCard} ${styles.featuredCard}`}>
            <h3>📤 New Analysis</h3>
            <div className={styles.uploadZone} onClick={() => !loading && document.getElementById('fileUpload').click()}>
              <span className={styles.uploadIconLarge}>{loading ? '⏳' : '📸'}</span>
              <p>{loading ? 'Uploading...' : `Send Scan to Dr. ${selectedDoctor || '...'}`}</p>
              <input type="file" id="fileUpload" hidden onChange={handleUpload} />
            </div>
          </section>

          {/* Section 3: Reports Tab */}
          <section className={styles.dashboardCard}>
            <h3>📊 My Reports</h3>
            <div className={styles.emptyStateMini}>No active reports found.</div>
            <button className={styles.historyBtn}>View History</button>
          </section>
        </div>

        {/* Section 4: Gallery Tab */}
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>📷 Recent Scans</h2>
          <div className={styles.emptyGallery}>
            <p>Your uploaded scalp images will appear here once processed.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;