import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { generateClinicalReportPDF } from "../../utils/reportGenerator";
import { useTheme } from "../../context/ThemeContext";
import { API_BASE_URL, assetUrl } from "../../config/api";
import logoImg from "../../assets/logo.jpg";
import styles from "./DoctorDashboard.module.css";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initScheduleState = (rawSchedule) => {
  return DAYS_OF_WEEK.map((day) => {
    if (Array.isArray(rawSchedule)) {
      const existing = rawSchedule.find((s) =>
        typeof s === "string" ? s === day : s?.day === day
      );
      if (existing) {
        if (typeof existing === "string") {
          return { day, available: true, startTime: "09:00", endTime: "17:00" };
        }
        return {
          day,
          available: existing.available !== false,
          startTime: existing.startTime || "09:00",
          endTime: existing.endTime || "17:00",
        };
      }
    }
    return { day, available: false, startTime: "09:00", endTime: "17:00" };
  });
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || "0", 10);
  if (Number.isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  const minute = Number.isNaN(m) ? "00" : String(m).padStart(2, "0");
  return `${String(hour12).padStart(2, "0")}:${minute} ${ampm}`;
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("queue");
  const [doctorName] = useState(localStorage.getItem("userName"));

  const [scans, setScans] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  // DIRECT ANALYSIS STATES
  const [directPatientName, setDirectPatientName] = useState("");
  const [directHairfallDescription, setDirectHairfallDescription] = useState("");
  const [directFile, setDirectFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [portalReports, setPortalReports] = useState([]);
  const [directReports, setDirectReports] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const [profileImage, setProfileImage] = useState("");

  const [speciality, setSpeciality] = useState("");

  const [contactNumber, setContactNumber] = useState("");
  const [about, setAbout] = useState("");

  const [weeklySchedule, setWeeklySchedule] = useState(() => initScheduleState([]));
  const [profileFile, setProfileFile] = useState(null);

  // SIGNATURE STUDIO STATES
  const [signatureImage, setSignatureImage] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureMode, setSignatureMode] = useState("draw"); // "draw" | "upload"
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "doctor") {
      navigate("/login", { replace: true });
      return;
    }

    fetchData();
    fetchProfile();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/doctor/data/${localStorage.getItem("userName")}`,
      );
      const allReports = res.data.reports || [];

      setPortalReports(allReports.filter((r) => r.doctorId !== "Direct"));

      setDirectReports(allReports.filter((r) => r.doctorId === "Direct"));

      setReports(allReports);
      setScans(res.data.scans || []);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/doctor/profile/${doctorName}`,
      );

      const doctor = res.data;

      setProfileImage(doctor.profileImage || "");
      setSignatureImage(doctor.signatureImage || "");
      setSpeciality(doctor.speciality || doctor.specialization || "");
      setContactNumber(doctor.contactNumber || doctor.phone || "");
      setAbout(doctor.about || "");
      setWeeklySchedule(initScheduleState(doctor.weeklySchedule || []));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDayToggle = (dayName) => {
    setWeeklySchedule((prev) =>
      prev.map((s) => (s.day === dayName ? { ...s, available: !s.available } : s))
    );
  };

  const handleTimeChange = (dayName, field, val) => {
    setWeeklySchedule((prev) =>
      prev.map((s) => (s.day === dayName ? { ...s, [field]: val } : s))
    );
  };

  const handlePreset = (dayName, startTime, endTime) => {
    setWeeklySchedule((prev) =>
      prev.map((s) =>
        s.day === dayName ? { ...s, available: true, startTime, endTime } : s
      )
    );
  };

  const showPatientNotes = (scan) => {
    Swal.fire({
      title: `📋 Patient Notes: ${scan.patientName}`,
      html: `
        <div style="text-align: left; background: #f8fafc; padding: 16px 20px; border-radius: 12px; margin-top: 10px; border: 1.5px solid #cbd5e1; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <div style="font-weight: 700; margin-bottom: 6px; color: #0284c7;">State of Hairfall &amp; Symptoms:</div>
          <p style="margin: 0; color: #334155; white-space: pre-wrap;">${scan.hairfallDescription ? scan.hairfallDescription : "<em>No additional clinical notes provided by patient.</em>"}</p>
        </div>
      `,
      icon: scan.hairfallDescription ? "info" : "question",
      confirmButtonText: "Close Notes",
      confirmButtonColor: "#0284c7",
    });
  };

  // Canvas Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const captureCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureImage(dataUrl);
    setSignatureFile(null);
    Swal.fire({
      icon: "success",
      title: "Signature Captured!",
      text: "Click 'Save Profile' below to permanently apply this signature to your reports.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const downloadReport = async (data) => {
    try {
      Swal.fire({
        title: "Generating Report...",
        text: "Preparing high-resolution clinical analysis PDF...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await generateClinicalReportPDF({
        ...data,
        doctorName: doctorName || "Specialist",
        assignedDoctor: doctorName,
        doctorSpeciality: speciality || "Hair Restoration Specialist",
        signatureImage: signatureImage || null,
        hairfallDescription: data.hairfallDescription || "",
      });

      Swal.close();
    } catch (err) {
      console.error("PDF Error:", err);
      Swal.fire("Error", `PDF Generation Failed: ${err?.message || "Please try again"}`, "error");
    }
  };

  const saveProfile = async () => {
    try {
      let uploadedImagePath = profileImage;
      let uploadedSignaturePath = signatureImage;

      // 1. Upload Profile Image
      if (profileFile) {
        const formData = new FormData();
        formData.append("file", profileFile);

        const uploadRes = await axios.post(
          `${API_BASE_URL}/api/doctor/upload-profile-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        uploadedImagePath = uploadRes.data.imagePath;
      }

      // 2. Upload Signature Image (File or Drawn Canvas Blob)
      if (signatureFile) {
        const sigData = new FormData();
        sigData.append("file", signatureFile);

        const sigRes = await axios.post(
          `${API_BASE_URL}/api/doctor/upload-signature`,
          sigData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        uploadedSignaturePath = sigRes.data.signaturePath;
      } else if (signatureImage && signatureImage.startsWith("data:image")) {
        const res = await fetch(signatureImage);
        const blob = await res.blob();
        const file = new File([blob], `sig_${Date.now()}.png`, { type: "image/png" });

        const sigData = new FormData();
        sigData.append("file", file);

        const sigRes = await axios.post(
          `${API_BASE_URL}/api/doctor/upload-signature`,
          sigData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        uploadedSignaturePath = sigRes.data.signaturePath;
      }

      // 3. Save Doctor Profile
      await axios.put(`${API_BASE_URL}/api/doctor/update-profile`, {
        doctorName,
        speciality,
        contactNumber,
        about,
        weeklySchedule,
        profileImage: uploadedImagePath,
        signatureImage: uploadedSignaturePath,
      });

      Swal.fire("Saved", "Doctor profile & daily schedule updated successfully!", "success");

      setProfileFile(null);
      setSignatureFile(null);
      fetchProfile();
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "Could not save profile", "error");
    }
  };
  const handleAnalyse = async (scan) => {
    const confirm = await Swal.fire({
      title: "Analyze Image?",
      text: `Run AI follicle detection on ${scan.patientName}'s scan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Analyze",
      confirmButtonColor: "#38bdf8",
    });

    if (confirm.isConfirmed) {
      Swal.fire({
        title: "AI Processing...",
        text: "Detecting follicle density...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await axios.put(
          `${API_BASE_URL}/api/doctor/process-scan/${scan.id}`,
        );

        Swal.fire("Success", "Analysis Complete & Report Generated", "success");

        fetchData();
      } catch (err) {
        const status = err.response?.status;

        const detail = err.response?.data?.detail || "Processing failed.";

        if (status === 503) {
          Swal.fire("Model Offline", detail, "warning");
        } else {
          Swal.fire("Error", "Could not connect to analysis server.", "error");
        }
      }
    }
  };

  const handleDirectAnalysis = async (e) => {
    e.preventDefault();

    if (!directFile || !directPatientName) {
      return Swal.fire(
        "Required",
        "Please provide a name and upload an image.",
        "warning",
      );
    }

    setIsProcessing(true);

    const formData = new FormData();

    formData.append("doctorName", doctorName);
    formData.append("patientName", directPatientName);
    formData.append("image", directFile);
    formData.append("hairfallDescription", directHairfallDescription);

    try {
      await axios.post(
        `${API_BASE_URL}/api/doctor/direct-analysis`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Swal.fire("Success", "Direct analysis complete.", "success");

      setDirectPatientName("");
      setDirectHairfallDescription("");
      setDirectFile(null);

      const fileInput = document.getElementById("directFileInput");
      if (fileInput) fileInput.value = null;

      fetchData();
    } catch (err) {
      const status = err.response?.status;

      const detail = err.response?.data?.detail || "Analysis Failed.";

      if (status === 503) {
        Swal.fire("Model Offline", detail, "warning");
      } else {
        Swal.fire("Analysis Failed", "Could not process the image.", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    navigate("/", { replace: true });
  };

  return (
    <div className={styles.dashboardWrapper}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogoWrap}>
          <img src={logoImg} alt="HFD AI Logo" className={styles.sidebarLogoImg} />
          <div className={styles.logo}>
            HFD<span>AI</span>
          </div>
        </div>

        <div className={styles.doctorBadge}>Clinical Portal</div>

        <nav className={styles.nav}>
          <button
            className={
              activeTab === "queue" ? styles.navItemActive : styles.navItem
            }
            onClick={() => setActiveTab("queue")}
          >
            👥 Patient Queue & Reports
          </button>

          <button
            className={
              activeTab === "direct" ? styles.navItemActive : styles.navItem
            }
            onClick={() => setActiveTab("direct")}
          >
            ⚡ Direct Fast Analysis
          </button>
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout Securely
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1>Welcome To The Doctor Dashboard</h1>
            <p>Review patient scans and run AI diagnostics.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeToggleBtn}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </header>
        <div className={styles.profileSection}>
          <div className={styles.profileLeft}>
            <div className={styles.profileImageWrapper}>
              {profileImage ? (
                <img
                  src={assetUrl(profileImage)}
                  alt="Doctor"
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  {doctorName?.charAt(0).toUpperCase()}
                </div>
              )}

              <button className={styles.editImageBtn}>✎</button>
            </div>

            <div className={styles.profileInfo}>
              <h2>Dr. {doctorName}</h2>

              <p>{speciality || "Hair Specialist"}</p>
              <div className={styles.profileMeta}>
                <div className={styles.metaItem}>
                  📞 {contactNumber || "Not Added"}
                </div>

                <div className={styles.metaItem}>
                  🗓 {weeklySchedule.filter((s) => s.available).length} Days Available
                </div>

                <div className={styles.metaItem}>
                  {signatureImage ? "🖋️ Custom E-Sign" : "🛡️ E-Seal Active"}
                </div>
              </div>
            </div>
          </div>

          <button
            className={styles.editProfileBtn}
            onClick={() => setShowProfile(!showProfile)}
          >
            Edit Profile
          </button>
        </div>
           
        {showProfile && (
          <div className={styles.profileModal}>
             <h2 className={styles.sectionTitle}>Doctor Profile Settings</h2>
            <div className={styles.profileGrid}>
              <div className={styles.profileInputGroup}>
                <label>Speciality</label>

                <input
                  type="text"
                  className={styles.profileInput}
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                />
              </div>
              <div className={styles.profileInputGroup}>
  <label>About</label>

  <textarea
    className={styles.profileTextarea}
    rows="4"
    value={about}
    onChange={(e) => setAbout(e.target.value)}
    placeholder="Write about your expertise..."
  />
</div>
              <div className={styles.profileInputGroup}>
                <label>Contact Number</label>

                <input
                  type="text"
                  className={styles.profileInput}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>

              <div className={styles.profileInputGroup}>
                <label>Upload Profile Image</label>

                <input
                  type="file"
                  accept="image/*"
                  className={styles.profileInput}
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (file) {
                      setProfileFile(file);

                      setProfileImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.scheduleWrapper}>
              <h3 className={styles.scheduleTitle}>Weekly Clinical Availability &amp; Hours</h3>
              <p className={styles.scheduleSubtitle}>
                Set the specific hours you will be available for consultations on each day of the week.
              </p>

              <div className={styles.scheduleGrid}>
                {weeklySchedule.map((item) => (
                  <div
                    key={item.day}
                    className={`${styles.scheduleCard} ${item.available ? styles.scheduleCardActive : ""}`}
                  >
                    <div className={styles.scheduleHeader}>
                      <label className={styles.scheduleLabel}>
                        <input
                          type="checkbox"
                          checked={item.available}
                          onChange={() => handleDayToggle(item.day)}
                        />
                        <span>{item.day}</span>
                      </label>

                      <span className={item.available ? styles.scheduleBadgeOn : styles.scheduleBadgeOff}>
                        {item.available ? "Available" : "Off"}
                      </span>
                    </div>

                    {item.available && (
                      <>
                        <div className={styles.timeRangeWrapper}>
                          <div className={styles.timeInputGroup}>
                            <label className={styles.timeInputLabel}>Start Time (From)</label>
                            <input
                              type="time"
                              className={styles.timePickerInput}
                              value={item.startTime || "09:00"}
                              onChange={(e) => handleTimeChange(item.day, "startTime", e.target.value)}
                            />
                          </div>

                          <div className={styles.timeInputGroup}>
                            <label className={styles.timeInputLabel}>End Time (To)</label>
                            <input
                              type="time"
                              className={styles.timePickerInput}
                              value={item.endTime || "17:00"}
                              onChange={(e) => handleTimeChange(item.day, "endTime", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className={styles.presetButtonsRow}>
                          <button
                            type="button"
                            className={styles.presetBtn}
                            onClick={() => handlePreset(item.day, "09:00", "17:00")}
                            title="Set hours 09:00 AM to 05:00 PM"
                          >
                            Full Day (9–5)
                          </button>
                          <button
                            type="button"
                            className={styles.presetBtn}
                            onClick={() => handlePreset(item.day, "09:00", "13:00")}
                            title="Set hours 09:00 AM to 01:00 PM"
                          >
                            Morning (9–1)
                          </button>
                          <button
                            type="button"
                            className={styles.presetBtn}
                            onClick={() => handlePreset(item.day, "16:00", "20:00")}
                            title="Set hours 04:00 PM to 08:00 PM"
                          >
                            Evening (4–8)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DIGITAL SIGNATURE STUDIO */}
            <div className={styles.signatureSectionWrapper}>
              <div className={styles.sigSectionHeader}>
                <div>
                  <h3 className={styles.scheduleTitle} style={{ marginBottom: "4px" }}>
                    🖋️ Clinical Digital Signature
                  </h3>
                  <p className={styles.sigSubtitle}>
                    This signature will be embedded onto the official PDF medical reports generated for your patients.
                  </p>
                </div>
                <div className={signatureImage ? styles.sigBadgeActive : styles.sigBadgeSeal}>
                  {signatureImage ? "✓ Signature Configured" : "🛡️ Digital Seal Fallback"}
                </div>
              </div>

              <div className={styles.sigModeTabs}>
                <button
                  type="button"
                  className={signatureMode === "draw" ? styles.sigTabActive : styles.sigTab}
                  onClick={() => setSignatureMode("draw")}
                >
                  ✍️ Draw Signature
                </button>
                <button
                  type="button"
                  className={signatureMode === "upload" ? styles.sigTabActive : styles.sigTab}
                  onClick={() => setSignatureMode("upload")}
                >
                  📁 Upload Signature File
                </button>
              </div>

              <div className={styles.sigContentContainer}>
                {signatureMode === "draw" ? (
                  <div className={styles.canvasContainer}>
                    <div className={styles.canvasHeader}>
                      <span>Draw your signature using mouse or stylus:</span>
                      <button type="button" onClick={clearCanvas} className={styles.canvasClearBtn}>
                        🔄 Clear Canvas
                      </button>
                    </div>
                    <div className={styles.canvasWrapper}>
                      <canvas
                        ref={canvasRef}
                        width={460}
                        height={130}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className={styles.signatureCanvas}
                      />
                    </div>
                    <div className={styles.canvasActions}>
                      <button
                        type="button"
                        onClick={captureCanvasSignature}
                        className={styles.captureSigBtn}
                      >
                        ✓ Adopt & Set Drawn Signature
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadSigContainer}>
                    <label>Select Signature Image (PNG or JPG)</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className={styles.profileInput}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSignatureFile(file);
                          setSignatureImage(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <span className={styles.sigHint}>
                      Recommended: Transparent PNG image (~400x150px) for best clarity on clinical PDF reports.
                    </span>
                  </div>
                )}

                {/* SIGNATURE PREVIEW */}
                <div className={styles.signaturePreviewBox}>
                  <div className={styles.sigPreviewLabel}>
                    Active Signature Preview on PDF:
                  </div>
                  {signatureImage ? (
                    <div className={styles.activeSigDisplay}>
                      <img
                        src={assetUrl(signatureImage)}
                        alt="Doctor Signature"
                        className={styles.signatureImgPreview}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSignatureImage("");
                          setSignatureFile(null);
                        }}
                        className={styles.removeSigBtn}
                      >
                        ✕ Remove Signature (Revert to Digital Seal)
                      </button>
                    </div>
                  ) : (
                    <div className={styles.noSigNotice}>
                      <span className={styles.sealIcon}>🛡️</span>
                      <div>
                        <strong>Default Digital Verification Seal Active</strong>
                        <p>No custom signature uploaded. Reports will feature a verified cryptographic E-Seal with unique verification hash.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button className={styles.saveProfileBtn} onClick={saveProfile}>
              Save Profile
            </button>
          </div>
        )}
        <div className={styles.dashboardCards}>
          <div className={`${styles.statsCard} ${styles.cardBlue}`}>
            <p className={styles.cardLabel}>Online Patients</p>

            <h1 className={styles.cardValue}>{portalReports.length}</h1>
          </div>

          <div className={`${styles.statsCard} ${styles.cardGreen}`}>
            <p className={styles.cardLabel}>Direct Analysis</p>

            <h1 className={styles.cardValue}>{directReports.length}</h1>
          </div>

          <div className={`${styles.statsCard} ${styles.cardDark}`}>
            <p className={styles.cardLabel}>Total Reports</p>

            <h1 className={styles.cardValue}>{reports.length}</h1>
          </div>
        </div>

        {/* ========================= */}
        {/* QUEUE TAB */}
        {/* ========================= */}

        {activeTab === "queue" ? (
          <div className={styles.sectionsContainer}>
            {/* PENDING SCANS */}
            <section className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>
                📸 Incoming Patient Scans (Pending)
              </h2>

              {loading ? (
                <p className={styles.loadingText}>Syncing queue...</p>
              ) : scans.length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Date Submitted</th>
                        <th>Patient Condition / Notes</th>
                        <th>Raw Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {scans.map((s, i) => (
                        <tr key={i}>
                          <td><strong>{s.patientName}</strong></td>

                          <td>{new Date(s.date).toLocaleDateString()}</td>

                          <td>
                            {s.hairfallDescription ? (
                              <button
                                type="button"
                                className={styles.notesBtn}
                                onClick={() => showPatientNotes(s)}
                                title="Click to view patient condition and symptoms"
                              >
                                💬 View Notes ({s.hairfallDescription.length > 18 ? `${s.hairfallDescription.slice(0, 18)}...` : s.hairfallDescription})
                              </button>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>
                            )}
                          </td>

                          <td>
                            <a
                              href={assetUrl(s.imagePath)}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.reviewLink}
                            >
                              View Scan ↗
                            </a>
                          </td>

                          <td>
                            <button
                              onClick={() => handleAnalyse(s)}
                              className={styles.actionBtn}
                            >
                              Analyze Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No pending scans at the moment.
                </div>
              )}
            </section>

            {/* PATIENT PORTAL REPORTS */}
            <section
              className={styles.contentCard}
              style={{ marginTop: "30px" }}
            >
              <h2 className={styles.sectionTitle} style={{ color: "#10b981" }}>
                📄 Generated Clinical Reports
              </h2>

              {reports.filter((r) => r.doctorId !== "Direct").length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Analysis Date</th>
                        <th>AI Result</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports
                        .filter((r) => r.doctorId !== "Direct")
                        .map((r, i) => (
                          <tr key={i}>
                            <td>{r.patientName}</td>

                            <td>
                              {r?.date
                                ? new Date(r.date).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </td>

                            <td>
                              <span className={styles.statusBadge}>
                                {r.baldnessStage}
                              </span>
                            </td>

                            <td>
                              <button
                                onClick={() => downloadReport(r)}
                                className={styles.downloadBtn}
                              >
                                Download PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No reports generated yet.
                </div>
              )}
            </section>
          </div>
        ) : (
          /* ========================= */
          /* DIRECT ANALYSIS TAB */
          /* ========================= */

          <div className={styles.sectionsContainer}>
            {/* DIRECT FORM */}
            <section className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>⚡ Direct Fast Analysis</h2>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: "20px",
                }}
              >
                Upload an image directly from your clinic for instant AI
                analysis.
              </p>

              <form
                onSubmit={handleDirectAnalysis}
                className={styles.directFormContainer}
              >
                <div className={styles.inputGroup}>
                  <label>Patient Name / ID</label>

                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. John Doe / PT-104"
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

                <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
                  <label>Patient Condition &amp; Hairfall State (Optional)</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g., Crown thinning, diffuse shedding for 3 months..."
                    value={directHairfallDescription}
                    onChange={(e) => setDirectHairfallDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.processBtn}
                  disabled={isProcessing}
                  style={{ gridColumn: "span 2" }}
                >
                  {isProcessing
                    ? "🤖 AI is Analyzing..."
                    : "Run Analysis & Generate Report"}
                </button>
              </form>
            </section>

            {/* DIRECT HISTORY */}
            <section
              className={styles.contentCard}
              style={{ marginTop: "30px" }}
            >
              <h2 className={styles.sectionTitle}>
                ⚡ Direct Analysis History
              </h2>

              {reports.filter((r) => r.doctorId === "Direct").length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Analysis Date</th>
                        <th>AI Result</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports
                        .filter((r) => r.doctorId === "Direct")
                        .map((r, i) => (
                          <tr key={i}>
                            <td>{r.patientName}</td>

                            <td>
                              {r?.date
                                ? new Date(r.date).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </td>

                            <td>
                              <span className={styles.statusBadge}>
                                {r.baldnessStage}
                              </span>
                            </td>

                            <td>
                              <button
                                onClick={() => downloadReport(r)}
                                className={styles.downloadBtn}
                              >
                                Download PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No direct analysis history.
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
