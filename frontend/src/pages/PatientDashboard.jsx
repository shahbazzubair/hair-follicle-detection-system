import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; 
import styles from './PatientDashboard.module.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('userName'));
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(false);
  const [myScans, setMyScans] = useState([]);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    if (!userName) {
      navigate('/login', { replace: true });
      return;
    }
    fetchPatientData();
  }, [userName, navigate]);

  const fetchPatientData = async () => {
    try {
      const docRes = await axios.get('http://localhost:8000/api/doctors/list');
      setDoctors(docRes.data);
      const dataRes = await axios.get(`http://localhost:8000/api/analysis/patient-data/${userName}`);
      setMyScans(dataRes.data.scans);
      setMyReports(dataRes.data.reports);
    } catch (err) {
      console.error("Failed to load user data");
    }
  };

  const downloadPDF = (report) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, { align: "center" });
      autoTable(doc, {
        startY: 40,
        head: [['Metric', 'Details']],
        body: [
          ['Patient Name', userName],
          ['Doctor', `Dr. ${report.doctorId}`],
          ['AI Result', report.baldnessStage],
          ['Clinical Status', 'Processed'],
          ['Date', new Date().toLocaleDateString()]
        ],
      });
      doc.save(`${userName}_Report_${report.baldnessStage.replace(' ', '_')}.pdf`);
    } catch (err) {
      Swal.fire("Download Failed", "PDF generation failed.", "error");
    }
  };

  const handleDownloadForScan = (scanImagePath) => {
    const report = myReports.find(r => r.imagePath === scanImagePath);
    if (report) {
      downloadPDF(report);
    } else {
      Swal.fire("Pending", "This scan is still waiting for doctor review.", "info");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedDoctor) {
      Swal.fire("Selection Required", "Please select a specialist.", "warning");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("patientName", userName);
    formData.append("doctorId", selectedDoctor); 
    formData.append("image_file", file); 
    try {
      await axios.post('http://localhost:8000/api/analysis/upload', formData);
      Swal.fire("Success", "Scan sent to Dr. " + selectedDoctor, "success");
      fetchPatientData(); 
    } catch (err) {
      Swal.fire("Upload Failed", "Backend connection error.", "error");
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
        <div className={styles.headerLeft}><h1 className={styles.logoText}>HFD<span>AI</span></h1></div>
        <div className={styles.headerRight}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{userName?.charAt(0)}</div>
            <div className={styles.userMeta}>
              <span className={styles.actualName}>{userName}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.welcomeHero}>
          <h2>Hello, {userName}! 👋</h2>
          <p>Manage your follicle scans and clinical reports in one place.</p>
        </div>
        <div className={styles.gridContainer}>
          <section className={styles.dashboardCard}>
            <h3>👨‍⚕️ Specialist</h3>
            <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className={styles.elegantSelect}>
              <option value="">-- Choose Specialist --</option>
              {doctors.map((doc, idx) => (
                <option key={idx} value={doc.fullName}>Dr. {doc.fullName}</option>
              ))}
            </select>
          </section>
          <section className={`${styles.dashboardCard} ${styles.featuredCard}`}>
            <h3>📤 New Analysis</h3>
            <div className={styles.uploadZone} onClick={() => !loading && document.getElementById('fileUpload').click()}>
              <span className={styles.uploadIconLarge}>{loading ? '⏳' : '📸'}</span>
              <p>{loading ? 'Uploading...' : 'Upload New Scan'}</p>
              <input type="file" id="fileUpload" hidden accept=".jpg, .png" onChange={handleUpload} />
            </div>
          </section>
          <section className={styles.dashboardCard}>
            <h3>📊 Latest Result</h3>
            {myReports.length > 0 ? (
              <div className={styles.miniReportCard}>
                <p>Status: <strong>{myReports[myReports.length - 1].baldnessStage}</strong></p>
                <button onClick={() => downloadPDF(myReports[myReports.length - 1])} className={styles.historyBtn}>Download Latest PDF</button>
              </div>
            ) : (
              <div className={styles.emptyStateMini}>Waiting for results...</div>
            )}
          </section>
        </div>
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>📷 My Scans & History</h2>
          {myScans.length > 0 ? (
            <div className={styles.scansGrid}>
              {myScans.map((s, idx) => (
                <div key={idx} className={styles.scanCard}>
                  <img src={`http://localhost:8000${s.imagePath}`} alt="Scan" className={styles.scanImage} />
                  <div className={styles.scanDetails}>
                    <p><strong>Dr. {s.doctorId}</strong></p>
                    <span className={styles.statusBadge}>{s.status}</span>
                    {s.status === "Processed" && (
                      <button onClick={() => handleDownloadForScan(s.imagePath)} className={styles.miniDownloadBtn}>Download Report</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyGallery}><p>No scans uploaded yet.</p></div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;