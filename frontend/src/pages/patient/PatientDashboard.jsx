import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; 
import styles from './PatientDashboard.module.css';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('userName'));
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // These will hold data from the backend
  const [myScans, setMyScans] = useState([]);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'patient') {
      navigate('/login', { replace: true });
      return;
    }
    fetchPatientData();
  }, [navigate]);

  const fetchPatientData = async () => {
    setDataLoading(true);
    try {
      // We will build these backend routes next!
      const docRes = await axios.get('http://localhost:8000/api/patient/doctors');
      setDoctors(docRes.data);
      
      const dataRes = await axios.get(`http://localhost:8000/api/patient/data/${localStorage.getItem('userName')}`);
      setMyScans(dataRes.data.scans || []);
      setMyReports(dataRes.data.reports || []);
    } catch (err) {
      console.error("Fetch error:", err);
      // Don't show error on first load if it's just empty
    } finally {
      setDataLoading(false);
    }
  };

  const downloadPDF = (report) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, { align: "center" });
      
      autoTable(doc, {
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }, // Brand blue
        head: [['Metric', 'Details']],
        body: [
          ['Patient Name', userName],
          ['Attending Doctor', `Dr. ${report.doctorName}`],
          ['AI Analysis Result', report.baldnessStage],
          ['Clinical Status', 'Processed & Verified'],
          ['Date of Report', new Date(report.date).toLocaleDateString()]
        ],
      });
      
      doc.save(`${userName}_Report.pdf`);
    } catch (err) {
      Swal.fire("Download Failed", "PDF generation failed.", "error");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedDoctor) {
      return Swal.fire("Selection Required", "Please select a specialist from the dropdown first.", "warning");
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("patientName", userName);
    formData.append("doctorId", selectedDoctor); 
    formData.append("image", file); 
    
    try {
      await axios.post('http://localhost:8000/api/patient/upload-scan', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Success", "Scan securely sent to the selected doctor.", "success");
      fetchPatientData(); // Refresh the gallery
    } catch (err) {
      Swal.fire("Upload Failed", "Could not upload the scan.", "error");
    } finally {
      setLoading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.dashboardWrapper}>
      {/* HEADER */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logoText}>HFD<span>AI</span></h1>
          <span className={styles.portalTag}>Patient Portal</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{userName?.charAt(0).toUpperCase()}</div>
            <span className={styles.actualName}>{userName}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <div className={styles.welcomeHero}>
          <h2>Hello, {userName}! 👋</h2>
          <p>Manage your follicle scans and clinical reports securely.</p>
        </div>

        <div className={styles.gridContainer}>
          {/* Action Card: Select Doctor */}
          <section className={styles.dashboardCard}>
            <h3>👨‍⚕️ 1. Choose Specialist</h3>
            <p className={styles.cardHelper}>Select an available doctor to review your scan.</p>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)} 
              className={styles.elegantSelect}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map((doc, idx) => (
                <option key={idx} value={doc.id}>Dr. {doc.fullName} ({doc.specialization})</option>
              ))}
            </select>
          </section>

          {/* Action Card: Upload */}
          <section className={`${styles.dashboardCard} ${styles.featuredCard}`}>
            <h3>📤 2. Upload Scan</h3>
            <p className={styles.cardHelper}>Upload a clear image of your scalp.</p>
            <div className={styles.uploadZone} onClick={() => !loading && document.getElementById('fileUpload').click()}>
              <span className={styles.uploadIconLarge}>{loading ? '⏳' : '📸'}</span>
              <p className={styles.uploadText}>{loading ? 'Uploading safely...' : 'Click to Upload New Scan'}</p>
              <input type="file" id="fileUpload" hidden accept=".jpg, .png, .jpeg" onChange={handleUpload} />
            </div>
          </section>

          {/* Action Card: Latest Report */}
          <section className={styles.dashboardCard}>
            <h3>📊 Latest Result</h3>
            {myReports.length > 0 ? (
              <div className={styles.miniReportCard}>
                <div className={styles.statusWrap}>
                  <span className={styles.label}>Diagnosis:</span>
                  <strong className={styles.diagnosis}>{myReports[myReports.length - 1].baldnessStage}</strong>
                </div>
                <button onClick={() => downloadPDF(myReports[myReports.length - 1])} className={styles.historyBtn}>
                  Download PDF Report
                </button>
              </div>
            ) : (
              <div className={styles.emptyStateMini}>No finalized reports yet.</div>
            )}
          </section>
        </div>

        {/* GALLERY SECTION */}
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>📷 My Scan History</h2>
          
          {dataLoading ? (
            <div className={styles.loadingState}>Syncing records...</div>
          ) : myScans.length > 0 ? (
            <div className={styles.scansGrid}>
              {myScans.map((s, idx) => (
                <div key={idx} className={styles.scanCard}>
                  <img src={`http://localhost:8000${s.imagePath}`} alt="Scan" className={styles.scanImage} />
                  <div className={styles.scanDetails}>
                    <p className={styles.docName}>Sent to: <strong>Dr. {s.doctorName}</strong></p>
                    <p className={styles.scanDate}>{new Date(s.date).toLocaleDateString()}</p>
                    
                    <div className={styles.actionRow}>
                      <span className={s.status === 'Processed' ? styles.statusProcessed : styles.statusPending}>
                        {s.status}
                      </span>
                      {s.status === "Processed" && (
                         <button 
                           onClick={() => downloadPDF(myReports.find(r => r.scanId === s.id))} 
                           className={styles.miniDownloadBtn}
                         >
                           PDF
                         </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyGallery}>
              <p>You haven't uploaded any scans yet. Select a doctor and upload an image to begin.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}