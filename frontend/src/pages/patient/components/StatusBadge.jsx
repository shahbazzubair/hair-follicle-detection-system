import styles from "../PatientDashboard.module.css";

const STATUS_MAP = {
  ready: { label: "Ready", className: styles.statusReady },
  uploading: { label: "Uploading…", className: styles.statusUploading },
  error: { label: "Upload Failed", className: styles.statusError },
  Pending: { label: "Pending Analysis", className: styles.statusPending },
  Processed: { label: "Completed", className: styles.statusCompleted },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_MAP[status] || { label: status || "Unknown", className: styles.statusPending };
  return <span className={`${styles.statusBadge} ${meta.className}`}>{meta.label}</span>;
}
