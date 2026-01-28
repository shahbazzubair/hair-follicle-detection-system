import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; // FIX: Specific import to resolve the TypeError
import styles from './DoctorDashboard.module.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue');
  const [doctorName] = useState(localStorage.getItem('userName'));
  const [scans, setScans] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'doctor') return navigate('/login');
    fetchData();
  }, [doctorName, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/analysis/doctor-data/${doctorName}`);
      setScans(res.data.scans);
      setReports(res.data.reports);
    } catch (err) { console.error("Sync error"); }
    finally { setLoading(false); }
  };

  const downloadReport = (data) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, { align: "center" });
      
      // FIX: Use the autoTable function directly to avoid the 'is not a function' error
      autoTable(doc, {
        startY: 40,
        head: [['Metric', 'Details']],
        body: [
          ['Patient Name', data.patientName],
          ['Assigned Doctor', `Dr. ${doctorName}`],
          ['Baldness Result', data.baldnessStage],
          ['Clinical Status', 'Verified'],
          ['Report Date', new Date().toLocaleDateString()]
        ],
      });

      doc.save(`${data.patientName}_Report.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      Swal.fire("Error", "PDF Generation Failed. Check Console.", "error");
    }
  };

  const handleAnalyse = async (scan) => {
    const confirm = await Swal.fire({
      title: 'Analyze Image?',
      text: `Process scan for ${scan.patientName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Analyse!'
    });

    if (confirm.isConfirmed) {
      Swal.fire({ title: 'AI Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await axios.put(`http://localhost:8000/api/analysis/process-patient/${scan.id}`);
        Swal.fire("Success", "Report Generated", "success");
        fetchData();
      } catch (err) { Swal.fire("Error", "Processing failed", "error"); }
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
        <nav className={styles.nav}>
          <button className={activeTab === 'queue' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('queue')}>👥 Patient Queue</button>
          <button className={activeTab === 'direct' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('direct')}>⚡ Direct Analysis</button>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}><h1>Welcome, Dr. {doctorName}</h1></header>

        {activeTab === 'queue' ? (
          <div className={styles.sectionsContainer}>
            {/* SEPARATE SECTION: INCOMING SCANS */}
            <section className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>📸 Incoming Patient Scans (Pending)</h2>
              <table className={styles.userTable}>
                <thead><tr><th>Patient</th><th>Raw Image</th><th>Action</th></tr></thead>
                <tbody>
                  {scans.map((s, i) => (
                    <tr key={i}>
                      <td>{s.patientName}</td>
                      <td><a href={`http://localhost:8000${s.imagePath}`} target="_blank" rel="noreferrer" className={styles.reviewLink}>View Scan ↗</a></td>
                      <td><button onClick={() => handleAnalyse(s)} className={styles.actionBtn}>Analyse Now</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* SEPARATE SECTION: GENERATED REPORTS */}
            <section className={styles.contentCard} style={{marginTop: '30px'}}>
              <h2 className={styles.sectionTitle} style={{color: '#10b981'}}>📄 Generated Clinical Reports (Downloadable)</h2>
              <table className={styles.userTable}>
                <thead><tr><th>Patient</th><th>AI Result</th><th>Action</th></tr></thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={i}>
                      <td>{r.patientName}</td>
                      <td><span className={styles.statusBadge}>{r.baldnessStage}</span></td>
                      <td><button onClick={() => downloadReport(r)} className={styles.actionBtn} style={{background: '#1e293b'}}>Download PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : (
          <section className={styles.contentCard}>
            <h2>Direct Analysis</h2>
            <input type="file" accept=".jpg, .jpeg, .png" />
          </section>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;