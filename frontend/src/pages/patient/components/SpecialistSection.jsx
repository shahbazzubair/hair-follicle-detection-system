import { useMemo, useState } from "react";
import DoctorListItem from "./DoctorListItem";
import EmptyState from "./EmptyState";
import { SkeletonDoctorRow } from "./Skeleton";
import styles from "../PatientDashboard.module.css";

export default function SpecialistSection({
  doctors,
  loading,
  error,
  onRetry,
  selectedDoctorId,
  onSelectDoctor,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("all");

  const specialities = useMemo(() => {
    const unique = new Set(
      doctors.map((d) => d.speciality).filter((s) => s && s.trim().length > 0),
    );
    return Array.from(unique).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return doctors.filter((doc) => {
      const matchesSearch =
        !term ||
        doc.fullName?.toLowerCase().includes(term) ||
        doc.speciality?.toLowerCase().includes(term);
      const matchesSpeciality =
        specialityFilter === "all" || doc.speciality === specialityFilter;
      return matchesSearch && matchesSpeciality;
    });
  }, [doctors, searchTerm, specialityFilter]);

  return (
    <section className={styles.dashboardCard}>
      <div className={styles.cardHeaderRow}>
        <div>
          <h3>Choose Specialist</h3>
          <p className={styles.chooseText}>Select a doctor to review your scan and analysis.</p>
        </div>
      </div>

      <div className={styles.specialistFilters}>
        <select
          className={styles.filterSelect}
          value={specialityFilter}
          onChange={(e) => setSpecialityFilter(e.target.value)}
          aria-label="Filter by speciality"
        >
          <option value="all">All Specialities</option>
          {specialities.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search doctor by name or speciality"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search doctors"
        />
      </div>

      <div className={styles.specialistList}>
        {loading ? (
          <>
            <SkeletonDoctorRow />
            <SkeletonDoctorRow />
            <SkeletonDoctorRow />
          </>
        ) : error ? (
          <EmptyState
            title="Unable to load specialists"
            message={error}
            action={{ label: "Retry", onClick: onRetry }}
          />
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No specialists available"
            message="Please check back later — new specialists will appear here once available."
          />
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            title="No matching specialists"
            message="Try a different name or clear the speciality filter."
          />
        ) : (
          filteredDoctors.map((doc) => (
            <DoctorListItem
              key={doc.id}
              doctor={doc}
              isSelected={selectedDoctorId === doc.id}
              onSelect={(selected) => onSelectDoctor(selected)}
            />
          ))
        )}
      </div>
    </section>
  );
}
