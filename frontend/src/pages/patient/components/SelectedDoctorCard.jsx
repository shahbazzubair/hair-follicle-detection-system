import { assetUrl } from "../api";
import { getInitials } from "../utils";
import styles from "../PatientDashboard.module.css";

export default function SelectedDoctorCard({ doctor, onDeselect }) {
  if (!doctor) return null;

  return (
    <section className={`${styles.dashboardCard} ${styles.doctorDetailsCard} ${styles.popIn}`}>
      <div className={styles.cardHeaderRow}>
        <h3 className={styles.detailsCardTitle}>Selected Doctor</h3>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onDeselect}
          title="Clear selection"
          aria-label="Clear selected doctor"
        >
          ✕
        </button>
      </div>

      <div className={styles.detailsHeader}>
        {doctor.profileImage ? (
          <img
            src={assetUrl(doctor.profileImage)}
            alt={doctor.fullName}
            className={styles.detailsAvatar}
          />
        ) : (
          <div className={styles.defaultMiniAvatarLarge}>{getInitials(doctor.fullName)}</div>
        )}
        <div>
          <h3>Dr. {doctor.fullName}</h3>
          <p>{doctor.speciality || "Hair Specialist"}</p>
        </div>
      </div>

      <div className={styles.infoBlock}>
        <h4>About</h4>
        <p>{doctor.about || "No information provided by doctor."}</p>
      </div>

      <div className={styles.infoBlock}>
        <h4>Availability</h4>
        {doctor.weeklySchedule?.length > 0 ? (
          <div className={styles.daysRow}>
            {doctor.weeklySchedule.map((day) => (
              <span key={day} className={styles.dayBadge}>{day}</span>
            ))}
          </div>
        ) : (
          <p className={styles.noDataMessage}>Availability not shared yet.</p>
        )}
      </div>

      {doctor.contactNumber && (
        <div className={styles.infoBlock}>
          <h4>Contact</h4>
          <p>{doctor.contactNumber}</p>
        </div>
      )}

      <div className={styles.infoBlock}>
        <button type="button" className={styles.bookingBtn} disabled title="Appointment booking is not available yet">
          Request Appointment — Coming Soon
        </button>
      </div>
    </section>
  );
}
