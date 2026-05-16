import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./PatientDashboard.module.css";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [userName] = useState(localStorage.getItem("userName"));

  const [doctors, setDoctors] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  const [loading, setLoading] = useState(false);

  const [dataLoading, setDataLoading] = useState(true);

  const [myScans, setMyScans] = useState([]);

  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    if (!userName) {
      navigate("/login", { replace: true });
      return;
    }

    fetchPatientData();
  }, [userName, navigate]);

  const fetchPatientData = async () => {
    setDataLoading(true);

    try {
      // UPDATED API
      const docRes = await axios.get(
        "http://localhost:8000/api/doctor/all-doctors",
      );
      setDoctors(docRes.data);

      const dataRes = await axios.get(
        `http://localhost:8000/api/patient/data/${userName}`,
      );

      setMyScans(dataRes.data.scans || []);

      setMyReports(dataRes.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  const downloadPDF = (report) => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");

      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, {
        align: "center",
      });

      autoTable(doc, {
        startY: 40,

        head: [["Metric", "Details"]],

        body: [
          ["Patient Name", userName],
          ["Doctor", `Dr. ${report.doctorName}`],
          ["AI Result", report.baldnessStage],
          ["Clinical Status", "Processed"],
          ["Date", new Date(report.date).toLocaleDateString()],
        ],
      });

      doc.save(`${userName}_Report.pdf`);
    } catch (err) {
      Swal.fire("Error", "PDF generation failed.", "error");
    }
  };

  const handleDownloadForScan = (scanId) => {
    const report = myReports.find((r) => r.scanId === scanId);

    if (report) {
      downloadPDF(report);
    } else {
      Swal.fire("Pending", "Report not generated yet.", "info");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!selectedDoctor) {
      Swal.fire("Required", "Please select a doctor first.", "warning");

      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("patientName", userName);

    formData.append("doctorId", selectedDoctor);

    formData.append("image", file);

    try {
      await axios.post(
        "http://localhost:8000/api/patient/upload-scan",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Swal.fire("Success", `Scan sent to Dr. ${selectedDoctorName}`, "success");

      fetchPatientData();
    } catch (err) {
      Swal.fire("Error", "Upload failed.", "error");
    } finally {
      setLoading(false);

      e.target.value = null;
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    navigate("/login", { replace: true });
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
              <span className={styles.actualName}>{userName}</span>
            </div>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className={styles.mainContent}>
        <div className={styles.welcomeHero}>
          <h2>Welcome, {userName}</h2>

          <p>Upload scalp scans and select your preferred doctor.</p>
        </div>

        {/* DOCTOR SECTION */}
        <section className={styles.dashboardCard}>
          <h3>👨‍⚕️ Choose Specialist</h3>

          <div className={styles.doctorDropdown}>
            {doctors.map((doc, idx) => (
              <div
                key={idx}
                className={`${styles.doctorOption} ${
                  selectedDoctor === doc.id ? styles.activeDoctorOption : ""
                }`}
                onClick={() => {
                  setSelectedDoctor(doc.id);
                  setSelectedDoctorName(doc.fullName);
                }}
              >
                {/* IMAGE CLICK => DETAILS */}
                <div
                  className={styles.doctorImageWrapper}
                  onClick={() =>
                    Swal.fire({
                      title: `Dr. ${doc.fullName}`,
                      html: `
                <p><b>Speciality:</b> ${doc.speciality || "Hair Specialist"}</p>

                <p><b>Contact:</b> ${doc.contactNumber || "Not Added"}</p>

                <p><b>Available Days:</b> ${
                  doc.weeklySchedule?.join(", ") || "No Schedule"
                }</p>
              `,
                      imageUrl: doc.profileImage
                        ? `http://localhost:8000${doc.profileImage}`
                        : "",
                      imageWidth: 120,
                      confirmButtonColor: "#2563eb",
                    })
                  }
                >
                  {doc.profileImage ? (
                    <img
                      src={`http://localhost:8000${doc.profileImage}`}
                      alt={doc.fullName}
                      className={styles.doctorMiniImage}
                    />
                  ) : (
                    <div className={styles.defaultMiniAvatar}>
                      {doc.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* NAME CLICK => SELECT */}
                <div
                  onClick={() => {
                    if (selectedDoctor === doc.id) {
                      setSelectedDoctor("");
                      setSelectedDoctorName("");
                    } else {
                      setSelectedDoctor(doc.id);
                      setSelectedDoctorName(doc.fullName);
                    }
                  }}
                >
                  <h4>Dr. {doc.fullName}</h4>

                  <p>{doc.speciality || "Hair Specialist"}</p>
                </div>

                {/* SELECTED BADGE */}
                {selectedDoctor === doc.id && (
                  <div className={styles.selectedBadge}>✓</div>
                )}
              </div>
            ))}
          </div>
        </section>
        {/* UPLOAD */}
        <section className={`${styles.dashboardCard} ${styles.featuredCard}`}>
          <h3>📸 Upload New Scan</h3>

          <div
            className={styles.uploadZone}
            onClick={() =>
              !loading && document.getElementById("fileUpload").click()
            }
          >
            <span className={styles.uploadIconLarge}>
              {loading ? "⏳" : "📤"}
            </span>

            <p>
              {loading
                ? "Uploading..."
                : selectedDoctor
                  ? `Send Scan To Dr. ${selectedDoctorName}`
                  : "Select Doctor First"}
            </p>

            <input
              type="file"
              id="fileUpload"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={handleUpload}
            />
          </div>
        </section>

        {/* HISTORY */}
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>My Scan History</h2>

          {dataLoading ? (
            <div className={styles.loadingState}>Loading records...</div>
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
                      <strong>Dr. {s.doctorName}</strong>
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

                    {s.status === "Processed" && (
                      <button
                        onClick={() => handleDownloadForScan(s.id)}
                        className={styles.miniDownloadBtn}
                      >
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyGallery}>No scans uploaded yet.</div>
          )}
        </section>
      </main>
    </div>
  );
}
