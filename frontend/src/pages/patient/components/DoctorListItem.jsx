import { assetUrl } from "../api";
import { getInitials } from "../utils";
import styles from "../PatientDashboard.module.css";

export default function DoctorListItem({ doctor, isSelected, onSelect }) {
  const hasSchedule = Array.isArray(doctor.weeklySchedule) && doctor.weeklySchedule.length > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.specialistItem} ${isSelected ? styles.activeSpecialist : ""}`}
      onClick={() => onSelect(doctor)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(doctor);
        }
      }}
      aria-pressed={isSelected}
    >
      <div className={styles.specialistLeft}>
        {doctor.profileImage ? (
          <img
            src={assetUrl(doctor.profileImage)}
            alt={doctor.fullName}
            className={styles.specialistAvatar}
          />
        ) : (
          <div className={styles.defaultMiniAvatar}>{getInitials(doctor.fullName)}</div>
        )}

        <div className={styles.doctorTextBlock}>
          <h4>Dr. {doctor.fullName}</h4>
          <p>{doctor.speciality || "Hair Specialist"}</p>
          <span className={hasSchedule ? styles.availabilityDotOn : styles.availabilityDotOff}>
            <i />
            {hasSchedule ? "Availability shared" : "Availability not set"}
          </span>
        </div>
      </div>

      {isSelected ? (
        <div className={styles.checkCircle} aria-hidden="true">✓</div>
      ) : (
        <span className={styles.arrow} aria-hidden="true">›</span>
      )}
    </div>
  );
}
