import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './DoctorDashboard.module.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue'); 
  const [doctorName] = useState(localStorage.getItem('userName'));
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempResult, setTempResult] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'doctor') {
      navigate('/login');
      return;
    }
    if (activeTab === 'queue') fetchMyPatients();
  }, [activeTab, doctorName, navigate]);

  const fetchMyPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/analysis/doctor/${doctorName}`);
      setPatients(response.data);
    } catch (err) {
      console.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return Swal.fire("Error", "Please select a scalp image", "error");

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`http://localhost:8000/api/analysis/process-direct`, formData);
      setTempResult(response.data);
      Swal.fire("Analysis Complete", "Walk-in report ready.", "success");
    } catch (err) {
      Swal.fire("Error", "Analysis failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={styles.dashboardWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>HFD<span>AI</span></div>
        <div className={styles.sidebarTag}>Doctor Panel</div>
        <nav className={styles.nav}>
          <button 
            className={activeTab === 'queue' ? styles.navItemActive : styles.navItem}
            onClick={() => { setActiveTab('queue'); setTempResult(null); }}
          >
            👥 Patient Queue
          </button>
          <button 
            className={activeTab === 'direct' ? styles.navItemActive : styles.navItem}
            onClick={() => setActiveTab('direct')}
          >
            ⚡ Direct Analysis
          </button>
          <button className={styles.navItem}>⚙️ Settings</button>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.welcomeSection}>
            <h1>Welcome, Dr. {doctorName} 🩺</h1>
            <p>{activeTab === 'queue' ? `Assigned Scans: ${patients.length}` : 'Walk-in Patient Analysis'}</p>
          </div>
          <div className={styles.avatar}>{doctorName?.charAt(0)}</div>
        </header>

        {activeTab === 'queue' ? (
          <section className={styles.contentCard}>
            <h2 style={{marginBottom: '20px'}}>Pending Review Queue</h2>
            <div style={{overflowX: 'auto'}}>
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
                    ) : patients.map((p, i) => (
                    <tr key={i} style={{borderBottom: '1px solid #f1f5f9'}}>
                        <td style={{padding: '15px', fontWeight: '700', color: '#1e293b'}}>{p.patientName}</td>
                        <td style={{padding: '15px'}}>
                            {/* FIX: Removed width:auto from inline style to let CSS handle it */}
                            <span className={styles.statusBadge}>
                                {p.status}
                            </span>
                        </td>
                        <td style={{padding: '15px'}}>
                        <a href={`http://localhost:8000${p.imagePath}`} target="_blank" rel="noreferrer" style={{color: '#38bdf8', fontWeight: 'bold', textDecoration: 'none'}}>Review ↗</a>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </section>
        ) : (
          <section className={styles.contentCard}>
            <div className={styles.statusHeader}>
              <div className={styles.iconCircle}>⚡</div>
              <h2>Instant Walk-in Analysis</h2>
            </div>
            <p className={styles.statusDescription}>Upload a patient's scalp image for immediate processing. Note: This data is <strong>not saved</strong> to the database for privacy.</p>
            
            {!tempResult ? (
              <form onSubmit={handleDirectUpload} style={{display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px'}}>
                <div style={{padding: '30px', border: '2px dashed #e2e8f0', borderRadius: '15px', textAlign: 'center'}}>
                    <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{marginBottom: '10px'}}
                    />
                    <p style={{fontSize: '0.8rem', color: '#64748b'}}>JPG, PNG or JPEG</p>
                </div>
                <button type="submit" className={styles.actionBtn} disabled={isProcessing}>
                  {isProcessing ? "AI is Analyzing..." : "Start Analysis"}
                </button>
              </form>
            ) : (
              <div style={{background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '2px solid #38bdf8'}}>
                <h3 style={{marginBottom: '15px'}}>AI Analysis Report</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
                    <div style={{background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>Follicle Count</span>
                        <p style={{fontSize: '1.5rem', fontWeight: '800', color: '#0f172a'}}>{tempResult.count}</p>
                    </div>
                    <div style={{background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>Avg. Density</span>
                        <p style={{fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8'}}>{tempResult.density} <small style={{fontSize: '0.7rem'}}>cm²</small></p>
                    </div>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button className={styles.actionBtn} onClick={() => window.print()}>Download PDF</button>
                  <button className={styles.actionBtn} style={{background: '#64748b'}} onClick={() => {setTempResult(null); setSelectedFile(null);}}>New Analysis</button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;