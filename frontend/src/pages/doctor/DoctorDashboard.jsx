import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; 
import styles from './DoctorDashboard.module.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue');
  const [doctorName] = useState(localStorage.getItem('userName'));
  
  const [scans, setScans] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Direct Analysis Tab
  const [directPatientName, setDirectPatientName] = useState('');
  const [directFile, setDirectFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'doctor') {
      navigate('/login', { replace: true });
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // We will build this backend route next!
      const res = await axios.get(`http://localhost:8000/api/doctor/data/${localStorage.getItem('userName')}`);
      setScans(res.data.scans || []);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (data) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, { align: "center" });
      
      autoTable(doc, {
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] }, // Matches Doctor theme
        head: [['Metric', 'Details']],
        body: [
          ['Patient Name', data.patientName],
          ['Assigned Doctor', `Dr. ${doctorName}`],
          ['AI Analysis Result', data.baldnessStage],
          ['Clinical Status', 'Verified & Processed'],
          ['Report Date', new Date(data.date || Date.now()).toLocaleDateString()]
        ],
      });

      doc.save(`${data.patientName}_Clinical_Report.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      Swal.fire("Error", "PDF Generation Failed. Check Console.", "error");
    }
  };

  const handleAnalyse = async (scan) => {
    const confirm = await Swal.fire({
      title: 'Analyze Image?',
      text: `Run AI follicle detection on ${scan.patientName}'s scan?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Analyze',
      confirmButtonColor: '#38bdf8'
    });

    if (confirm.isConfirmed) {
      Swal.fire({ title: 'AI Processing...', text: 'Detecting follicle density...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await axios.put(`http://localhost:8000/api/doctor/process-scan/${scan.id}`);
        Swal.fire("Success", "Analysis Complete & Report Generated", "success");
        fetchData(); // Refresh queue
      } catch (err) { 
        Swal.fire("Error", "Processing failed.", "error"); 
      }
    }
  };

  const handleDirectAnalysis = async (e) => {
    e.preventDefault();
    if (!directFile || !directPatientName) return Swal.fire("Required", "Please provide a name and upload an image.", "warning");

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("doctorName", doctorName);
    formData.append("patientName", directPatientName);
    formData.append("image", directFile);

    try {
      await axios.post('http://localhost:8000/api/doctor/direct-analysis', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Success", "Direct analysis complete. Report added to your records.", "success");
      setDirectPatientName('');
      setDirectFile(null);
      document.getElementById('directFileInput').value = null;
      fetchData(); // Refresh to show new report
      setActiveTab('queue'); // Switch back to see the report
    } catch (err) {
      Swal.fire("Analysis Failed", "Could not process the image.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.dashboardWrapper}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>HFD<span>AI</span></div>
        <div className={styles.doctorBadge}>Clinical Portal</div>
        
        <nav className={styles.nav}>
          <button className={activeTab === 'queue' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('queue')}>
            👥 Patient Queue & Reports
          </button>
          <button className={activeTab === 'direct' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('direct')}>
            ⚡ Direct Fast Analysis
          </button>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout Securely</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Welcome, Dr. {doctorName}</h1>
          <p>Review patient scans and run AI diagnostics.</p>
        </header>

        {activeTab === 'queue' ? (
          <div className={styles.sectionsContainer}>
            
            {/* PENDING SCANS TABLE */}
            <section className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>📸 Incoming Patient Scans (Pending)</h2>
              {loading ? <p className={styles.loadingText}>Syncing queue...</p> : scans.length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead><tr><th>Patient Name</th><th>Date Submitted</th><th>Raw Image</th><th>Action</th></tr></thead>
                    <tbody>
                      {scans.map((s, i) => (
                        <tr key={i}>
                          <td>{s.patientName}</td>
                          <td>{new Date(s.date).toLocaleDateString()}</td>
                          <td><a href={`http://localhost:8000${s.imagePath}`} target="_blank" rel="noreferrer" className={styles.reviewLink}>View Scan ↗</a></td>
                          <td><button onClick={() => handleAnalyse(s)} className={styles.actionBtn}>Analyze Now</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>No pending scans at the moment.</div>
              )}
            </section>

            {/* GENERATED REPORTS TABLE */}
            <section className={styles.contentCard} style={{marginTop: '30px'}}>
              <h2 className={styles.sectionTitle} style={{color: '#10b981'}}>📄 Generated Clinical Reports</h2>
              {reports.length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead><tr><th>Patient Name</th><th>Analysis Date</th><th>AI Result</th><th>Action</th></tr></thead>
                    <tbody>
                      {reports.map((r, i) => (
                        <tr key={i}>
                          <td>{r.patientName}</td>
                          <td>{new Date(r.date || Date.now()).toLocaleDateString()}</td>
                          <td><span className={styles.statusBadge}>{r.baldnessStage}</span></td>
                          <td><button onClick={() => downloadReport(r)} className={styles.downloadBtn}>Download PDF</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>No reports generated yet.</div>
              )}
            </section>
          </div>
        ) : (
          
          /* DIRECT ANALYSIS TOOL */
          <section className={styles.contentCard}>
            <h2 className={styles.sectionTitle}>⚡ Direct Fast Analysis</h2>
            <p style={{color: '#64748b', marginBottom: '20px'}}>Bypass the patient portal. Upload an image directly from your clinic for instant AI analysis.</p>
            
            <form onSubmit={handleDirectAnalysis} className={styles.directFormContainer}>
              <div className={styles.inputGroup}>
                <label>Patient Name / ID</label>
                <input 
                  type="text" 
                  className={styles.inputField} 
                  placeholder="e.g., John Doe or #45992" 
                  value={directPatientName}
                  onChange={(e) => setDirectPatientName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Scalp Image</label>
                <input 
                  type="file" 
                  id="directFileInput"
                  className={styles.inputField} 
                  accept=".jpg, .jpeg, .png" 
                  onChange={(e) => setDirectFile(e.target.files[0])}
                  required
                />
              </div>
              <button type="submit" className={styles.processBtn} disabled={isProcessing}>
                {isProcessing ? '🤖 AI is Analyzing...' : 'Run Analysis & Generate Report'}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}