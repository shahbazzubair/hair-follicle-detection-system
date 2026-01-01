import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DoctorDashboard.module.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState(localStorage.getItem('userName'));
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'doctor') {
      navigate('/login');
      return;
    }

    const fetchMyPatients = async () => {
      try {
        // Fetches scans where doctorId matches this doctor's name
        const response = await axios.get(`http://localhost:8000/api/analysis/doctor/${doctorName}`);
        setPatients(response.data);
      } catch (err) {
        console.error("Failed to load assigned patients");
      } finally {
        setLoading(false);
      }
    };
    fetchMyPatients();
  }, [doctorName, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.bgBlob1}></div>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>HFD<span>AI</span></div>
        <nav className={styles.nav}>
          <button className={styles.navItemActive}>👥 My Patients</button>
          <button className={styles.navItem}>📁 Case History</button>
          <button className={styles.navItem}>⚙️ Settings</button>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.welcomeSection}>
            <h1>Welcome, Dr. {doctorName} 🩺</h1>
            <p>You have {patients.length} scan(s) awaiting review.</p>
          </div>
          <div className={styles.avatar}>{doctorName?.charAt(0)}</div>
        </header>

        <section className={styles.contentCard}>
          <h2 style={{marginBottom: '20px'}}>Patient Analysis Queue</h2>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b'}}>
                <th style={{padding: '15px'}}>Patient Name</th>
                <th style={{padding: '15px'}}>Status</th>
                <th style={{padding: '15px'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{padding: '20px', textAlign: 'center'}}>Loading Queue...</td></tr>
              ) : patients.length > 0 ? (
                patients.map((p, i) => (
                  <tr key={i} style={{borderBottom: '1px solid #f1f5f9'}}>
                    <td style={{padding: '15px', fontWeight: '700'}}>{p.patientName}</td>
                    <td style={{padding: '15px'}}>
                      <span style={{padding: '5px 12px', background: '#fffbeb', color: '#f59e0b', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{padding: '15px'}}>
                      <a 
                        href={`http://localhost:8000${p.imagePath}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{color: '#38bdf8', fontWeight: 'bold', textDecoration: 'none'}}
                      >
                        Review Scan ↗
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{padding: '20px', textAlign: 'center'}}>No pending analysis requests.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;