import styles from "../PatientDashboard.module.css";

export default function EmptyState({ title, message, action }) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyStateTitle}>{title}</p>
      {message && <p className={styles.emptyStateMessage}>{message}</p>}
      {action && (
        <button type="button" className={styles.emptyStateAction} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
