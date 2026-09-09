import styles from "../PatientDashboard.module.css";

export function SkeletonDoctorRow() {
  return (
    <div className={styles.skeletonDoctorRow} aria-hidden="true">
      <div className={`${styles.skeletonShimmer} ${styles.skeletonAvatar}`} />
      <div className={styles.skeletonLines}>
        <div className={`${styles.skeletonShimmer} ${styles.skeletonLineShort}`} />
        <div className={`${styles.skeletonShimmer} ${styles.skeletonLineTiny}`} />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className={styles.skeletonTableRow} aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div className={`${styles.skeletonShimmer} ${styles.skeletonLineShort}`} />
        </td>
      ))}
    </tr>
  );
}
