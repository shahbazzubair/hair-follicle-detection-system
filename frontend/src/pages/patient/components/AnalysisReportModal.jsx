import { useEffect } from "react";
import { assetUrl } from "../api";
import { formatDateTime } from "../utils";
import styles from "../PatientDashboard.module.css";

export default function AnalysisReportModal({ row, onClose, onDownload }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!row) return null;
  const { report } = row;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-label="Analysis report"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.modalCloseBtn} onClick={onClose} aria-label="Close report">
          ✕
        </button>

        <h3 className={styles.modalTitle}>Analysis Report</h3>

        <div className={styles.modalBody}>
          <img src={assetUrl(row.imagePath)} alt="Scalp scan" className={styles.modalImage} />

          <div className={styles.modalDetails}>
            <div className={styles.modalDetailRow}>
              <span>Baldness Stage / Classification</span>
              <strong>{report?.baldnessStage || "Results Pending"}</strong>
            </div>
            <div className={styles.modalDetailRow}>
              <span>Reviewing Doctor</span>
              <strong>Dr. {row.doctorName || "—"}</strong>
            </div>
            <div className={styles.modalDetailRow}>
              <span>Date of Analysis</span>
              <strong>{formatDateTime(row.date)}</strong>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.primaryBtn} onClick={() => onDownload(report)}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
