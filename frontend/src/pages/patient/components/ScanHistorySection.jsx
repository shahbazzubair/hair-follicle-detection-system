import { useMemo, useState } from "react";
import { assetUrl } from "../api";
import { formatDateTime, getInitials, shortScanId } from "../utils";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { SkeletonTableRow } from "./Skeleton";
import styles from "../PatientDashboard.module.css";

function buildRows(scans, reports) {
  const reportByScanId = new Map(reports.map((r) => [r.scanId, r]));
  return scans.map((scan) => ({
    ...scan,
    report: reportByScanId.get(scan.id) || null,
  }));
}

export default function ScanHistorySection({ scans, reports, loading, error, onRetry, onViewReport, onDownload }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const rows = useMemo(() => buildRows(scans, reports), [scans, reports]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = rows.filter((row) => {
      const matchesSearch =
        !term ||
        row.doctorName?.toLowerCase().includes(term) ||
        row.id?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result = result.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sortOrder === "newest" ? -diff : diff;
    });

    return result;
  }, [rows, searchTerm, statusFilter, sortOrder]);

  const renderActions = (row) => (
    <div className={styles.rowActions}>
      {row.status === "Processed" && row.report ? (
        <>
          <button type="button" className={styles.linkBtn} onClick={() => onViewReport(row)}>
            View Report
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Download PDF report"
            aria-label="Download PDF report"
            onClick={() => onDownload(row.report)}
          >
            ⬇
          </button>
        </>
      ) : (
        <span className={styles.pendingNote}>Your analysis is still being processed.</span>
      )}
    </div>
  );

  return (
    <section className={styles.gallerySection}>
      <div className={styles.historyHeaderRow}>
        <h2 className={styles.sectionTitle}>My Scan History</h2>

        <div className={styles.historyControls}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by doctor or scan ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search scan history"
          />

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Analysis</option>
            <option value="Processed">Completed</option>
          </select>

          <select
            className={styles.filterSelect}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort by date"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.tableResponsive}>
          <table className={styles.historyTable}>
            <tbody>
              <SkeletonTableRow columns={5} />
              <SkeletonTableRow columns={5} />
              <SkeletonTableRow columns={5} />
            </tbody>
          </table>
        </div>
      ) : error ? (
        <EmptyState
          title="Unable to load scan history"
          message={error}
          action={{ label: "Retry", onClick: onRetry }}
        />
      ) : scans.length === 0 ? (
        <EmptyState
          title="No scans yet"
          message="Upload your first scalp scan to begin analysis."
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title="No matching scans"
          message="Try adjusting your search or filter."
        />
      ) : (
        <>
          <div className={`${styles.tableResponsive} ${styles.desktopOnly}`}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Scan ID</th>
                  <th>Date &amp; Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td title={row.id}>{shortScanId(row.id)}</td>
                    <td>{formatDateTime(row.date)}</td>
                    <td>
                      <div className={styles.doctorCell}>
                        <span className={styles.miniAvatarText}>{getInitials(row.doctorName)}</span>
                        Dr. {row.doctorName || "—"}
                      </div>
                    </td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.report?.baldnessStage || "—"}</td>
                    <td>{renderActions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${styles.historyCards} ${styles.mobileOnly}`}>
            {filteredRows.map((row) => (
              <div key={row.id} className={styles.historyCard}>
                <div className={styles.historyCardTop}>
                  <img
                    src={assetUrl(row.imagePath)}
                    alt="Scan"
                    className={styles.historyCardImage}
                  />
                  <div>
                    <p className={styles.historyCardId}>{shortScanId(row.id)}</p>
                    <p className={styles.historyCardDate}>{formatDateTime(row.date)}</p>
                    <p className={styles.historyCardDoctor}>Dr. {row.doctorName || "—"}</p>
                  </div>
                </div>
                <div className={styles.historyCardBottom}>
                  <StatusBadge status={row.status} />
                  {row.report?.baldnessStage && <span className={styles.resultText}>{row.report.baldnessStage}</span>}
                </div>
                {renderActions(row)}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
