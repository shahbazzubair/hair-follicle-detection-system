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
    setDataLoading(true);

    try {
      // KEEPING YOUR ORIGINAL API ROUTES
      const docRes = await axios.get('http://localhost:8000/api/patient/doctors');
      setDoctors(docRes.data);

      const dataRes = await axios.get(
        `http://localhost:8000/api/patient/data/${localStorage.getItem('userName')}`
      );

      setMyScans(dataRes.data.scans || []);
      setMyReports(dataRes.data.reports || []);
    } catch (err) {
      console.error("Failed to load user data");
    } finally {
      setDataLoading(false);
    }
  };

  const downloadPDF = (report) => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, {
        align: "center"
      });

      autoTable(doc, {
        startY: 40,
        head: [['Metric', 'Details']],
        body: [
          ['Patient Name', userName],
          ['Doctor', `Dr. ${report.doctorName}`],
          ['AI Result', report.baldnessStage],
          ['Clinical Status', 'Processed'],
          ['Date', new Date(report.date).toLocaleDateString()]
        ],
      });

      doc.save(
        `${userName}_Report_${report.baldnessStage.replace(' ', '_')}.pdf`
      );

    } catch (err) {
      Swal.fire("Download Failed", "PDF generation failed.", "error");
    }
  };

  // NEW FUNCTIONALITY FROM SECOND CODE
  const handleDownloadForScan = (scanId) => {
    const report = myReports.find(r => r.scanId === scanId);

    if (report) {
      downloadPDF(report);
    } else {
      Swal.fire(
        "Pending",
        "This scan is still waiting for doctor review.",
        "info"
      );
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!selectedDoctor) {
      Swal.fire(
        "Selection Required",
        "Please select a specialist.",
        "warning"
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // KEEPING YOUR ORIGINAL BACKEND FIELD NAMES
    formData.append("patientName", userName);
    formData.append("doctorId", selectedDoctor);
    formData.append("image", file);

    try {
      // KEEPING YOUR ORIGINAL ROUTE
      await axios.post(
        'http://localhost:8000/api/patient/upload-scan',
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      Swal.fire(
        "Success",
        "Scan sent successfully.",
        "success"
      );

      fetchPatientData();

    } catch (err) {
      Swal.fire(
        "Upload Failed",
        "Backend connection error.",
        "error"
      );
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.dashboardWrapper}>

      {/* HEADER */}
      <header className={styles.dashboardHeader}>

        <div className={styles.headerLeft}>
          <h1 className={styles.logoText}>
            HFD<span>AI</span>
          </h1>
        </div>

        <div className={styles.headerRight}>

          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {userName?.charAt(0).toUpperCase()}
            </div>

            <div className={styles.userMeta}>
              <span className={styles.actualName}>
                {userName?.charAt(0).toUpperCase() + userName?.slice(1)}
              </span>
            </div>
          </div>

          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>

        <div className={styles.welcomeHero}>
          <h2>
            Welcome, {userName?.charAt(0).toUpperCase() + userName?.slice(1)}
          </h2>

          <p>
            Manage your follicle scans and clinical reports in one place.
          </p>
        </div>

        <div className={styles.gridContainer}>

          {/* SPECIALIST */}
          <section className={styles.dashboardCard}>
            <h3>👨‍⚕️ Specialist</h3>

            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className={styles.elegantSelect}
            >
              <option value="">-- Choose Specialist --</option>

              {doctors.map((doc, idx) => (
                <option key={idx} value={doc.id}>
                  Dr. {doc.fullName} ({doc.specialization})
                </option>
              ))}
            </select>
          </section>

          {/* UPLOAD */}
          <section className={`${styles.dashboardCard} ${styles.featuredCard}`}>
            <h3>New Analysis</h3>

            <div
              className={styles.uploadZone}
              onClick={() =>
                !loading &&
                document.getElementById('fileUpload').click()
              }
            >
              <span className={styles.uploadIconLarge}>
                {loading ? '⏳' : '📸'}
              </span>

              <p>
                {loading ? 'Uploading...' : 'Upload New Scan'}
              </p>

              <input
                type="file"
                id="fileUpload"
                hidden
                accept=".jpg, .png, .jpeg"
                onChange={handleUpload}
              />
            </div>
          </section>

          {/* LATEST RESULT */}
          <section className={styles.dashboardCard}>
            <h3>Latest Result</h3>

            {myReports.length > 0 ? (
              <div className={styles.miniReportCard}>

                <p>
                  Status:
                  <strong>
                    {" "}
                    {myReports[myReports.length - 1].baldnessStage}
                  </strong>
                </p>

                <button
                  onClick={() =>
                    downloadPDF(myReports[myReports.length - 1])
                  }
                  className={styles.historyBtn}
                >
                  Download Latest PDF
                </button>

              </div>
            ) : (
              <div className={styles.emptyStateMini}>
                Waiting for results...
              </div>
            )}
          </section>

        </div>

        {/* HISTORY */}
        <section className={styles.gallerySection}>

          <h2 className={styles.sectionTitle}>
            My Scans & History
          </h2>

          {dataLoading ? (

            <div className={styles.loadingState}>
              Syncing records...
            </div>

          ) : myScans.length > 0 ? (

            <div className={styles.scansGrid}>

              {myScans.map((s, idx) => (

                <div key={idx} className={styles.scanCard}>

                  <img
                    src={`http://localhost:8000${s.imagePath}`}
                    alt="Scan"
                    className={styles.scanImage}
                  />

                  <div className={styles.scanDetails}>

                    <p>
                      <strong>
                        Dr. {s.doctorName}
                      </strong>
                    </p>

                    <span
                      className={
                        s.status === "Processed"
                          ? styles.statusProcessed
                          : styles.statusPending
                      }
                    >
                      {s.status}
                    </span>

               {s.status === "Processed" && myReports?.some(r =>r.scanId === s.id &&r.baldnessStage &&r.baldnessStage !== "Results Pending") && (
                <button onClick={() => handleDownloadForScan(s.id)}className={styles.miniDownloadBtn}>
                 Download Report
                </button>
              )}

                  </div>
                </div>

              ))}

            </div>

          ) : (

            <div className={styles.emptyGallery}>
              <p>No scans uploaded yet.</p>
            </div>

          )}

        </section>

      </main>
    </div>
  );
}