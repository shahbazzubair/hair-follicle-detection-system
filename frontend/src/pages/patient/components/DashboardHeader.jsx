import { getInitials } from "../utils";
import { useTheme } from "../../../context/ThemeContext";
import logoImg from "../../../assets/logo.jpg";
import styles from "../PatientDashboard.module.css";

export default function DashboardHeader({ userName, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <img src={logoImg} alt="HFD AI Logo" className={styles.headerLogoImg} />
        <h1 className={styles.logoText}>
          HFD<span>AI</span>
        </h1>
      </div>

      <div className={styles.headerRight}>
        <button
          type="button"
          onClick={toggleTheme}
          className={styles.themeToggleBtn}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

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
