import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import DashboardHeader from "./components/DashboardHeader";
import SpecialistSection from "./components/SpecialistSection";
import SelectedDoctorCard from "./components/SelectedDoctorCard";
import ScanUploadCard from "./components/ScanUploadCard";
import ScanHistorySection from "./components/ScanHistorySection";
import AnalysisReportModal from "./components/AnalysisReportModal";

import { getAllDoctors, getPatientData } from "./api";
import { friendlyErrorMessage } from "./utils";
import { generateClinicalReportPDF } from "../../utils/reportGenerator";
import styles from "./PatientDashboard.module.css";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem("userName"));

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState("");

  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [myScans, setMyScans] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const [activeReportRow, setActiveReportRow] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!userName || role !== "patient") {
      navigate("/login", { replace: true });
    }
  }, [userName, navigate]);

  const fetchDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    setDoctorsError("");
    try {
      const res = await getAllDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      setDoctorsError(friendlyErrorMessage(err, "Unable to load specialists right now."));
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userName) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await getPatientData(userName);
      setMyScans(res.data.scans || []);
      setMyReports(res.data.reports || []);
    } catch (err) {
      setHistoryError(friendlyErrorMessage(err, "Unable to load your scan history right now."));
    } finally {
      setHistoryLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    if (!userName) return;
    fetchDoctors();
    fetchHistory();
  }, [userName, fetchDoctors, fetchHistory]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || null;

  const handleSelectDoctor = (doc) => {
    setSelectedDoctorId((prev) => (prev === doc.id ? "" : doc.id));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleDownload = async (report) => {
    if (!report) {
      Swal.fire("Pending", "Report not generated yet.", "info");
      return;
    }

    try {
      Swal.fire({
        title: "Generating Report...",
        text: "Preparing your clinical analysis PDF...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await generateClinicalReportPDF({
        ...report,
        patientName: userName || "Patient",
        doctorName: report.doctorName || "Specialist",
      });

      Swal.close();
    } catch (err) {
      console.error("PDF Error:", err);
      Swal.fire("Error", `PDF Generation Failed: ${err?.message || "Please try again"}`, "error");
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <DashboardHeader userName={userName} onLogout={handleLogout} />

      <main className={styles.mainContent}>
        <div className={styles.welcomeHero}>
          <h2>Welcome, {userName}</h2>
          <p>Select a specialist and upload a scalp scan to get started.</p>
        </div>

        <div className={selectedDoctor ? styles.dashboardGrid : styles.dashboardGridSingle}>
          <div className={styles.dashboardMainColumn}>
            <SpecialistSection
              doctors={doctors}
              loading={doctorsLoading}
              error={doctorsError}
              onRetry={fetchDoctors}
              selectedDoctorId={selectedDoctorId}
              onSelectDoctor={handleSelectDoctor}
            />
          </div>

          {selectedDoctor && (
            <div className={styles.dashboardSideColumn}>
              <SelectedDoctorCard
                doctor={selectedDoctor}
                onDeselect={() => setSelectedDoctorId("")}
              />
            </div>
          )}
        </div>

        <ScanUploadCard
          patientName={userName}
          selectedDoctorId={selectedDoctorId}
          selectedDoctorName={selectedDoctor?.fullName}
          onUploadSuccess={() => {
            Swal.fire("Success", `Scan sent to Dr. ${selectedDoctor?.fullName}`, "success");
            fetchHistory();
          }}
        />

        <ScanHistorySection
          scans={myScans}
          reports={myReports}
          loading={historyLoading}
          error={historyError}
          onRetry={fetchHistory}
          onViewReport={(row) => setActiveReportRow(row)}
          onDownload={handleDownload}
        />
      </main>

      <AnalysisReportModal
        row={activeReportRow}
        onClose={() => setActiveReportRow(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
