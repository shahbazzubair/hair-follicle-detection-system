import { getInitials } from "../utils";
import styles from "../PatientDashboard.module.css";

export default function DashboardHeader({ userName, onLogout }) {
  return (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <h1 className={styles.logoText}>
          HFD<span>AI</span>
        </h1>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.userProfile}>
          <div className={styles.avatar} aria-hidden="true">
            {getInitials(userName)}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.actualName}>{userName || "Patient"}</span>
          </div>
        </div>

        <button type="button" className={styles.logoutBtn} onClick={onLogout} aria-label="Logout">
          Logout
        </button>
      </div>
    </header>
  );
}
