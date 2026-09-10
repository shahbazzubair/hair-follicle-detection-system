import { useRef, useState } from "react";
import { uploadScan } from "../api";
import { formatFileSize, friendlyErrorMessage } from "../utils";
import styles from "../PatientDashboard.module.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export default function ScanUploadCard({ patientName, selectedDoctorId, selectedDoctorName, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | invalid | uploading | error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setStatus("idle");
    setProgress(0);
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = null;
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setStatus("invalid");
      setErrorMessage("Unsupported file type. Please upload a JPG or PNG image.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setStatus("idle");
    setErrorMessage("");
  };

  const handleBrowse = () => inputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    validateAndSetFile(dropped);
  };

  const handleCancelUpload = () => {
    abortRef.current?.abort();
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (!selectedDoctorId) {
      setStatus("invalid");
      setErrorMessage("Please select a doctor before starting the analysis.");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");

    const controller = new AbortController();
    abortRef.current = controller;

    const formData = new FormData();
    formData.append("patientName", patientName);
    formData.append("doctorId", selectedDoctorId);
    formData.append("image", file);

    try {
      await uploadScan(formData, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      resetSelection();
      onUploadSuccess();
    } catch (err) {
      if (err?.code === "ERR_CANCELED") {
        resetSelection();
        return;
      }
      setStatus("error");
      setErrorMessage(friendlyErrorMessage(err, "Upload failed. Please try again."));
    }
  };

  return (
    <section className={`${styles.dashboardCard} ${styles.featuredCard}`}>
      <div className={styles.cardHeaderRow}>
        <div>
          <h3>Upload New Scan</h3>
          <p className={styles.chooseText}>Upload a scalp/hair image for follicle analysis.</p>
        </div>
      </div>

      {!file ? (
        <div
          className={`${styles.uploadZone} ${dragActive ? styles.uploadZoneActive : ""}`}
          onClick={handleBrowse}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
        >
          <span className={styles.uploadIconLarge} aria-hidden="true">📤</span>
          <p>Drag & drop your scalp image here, or click to browse</p>
          <span className={styles.uploadHint}>Accepted formats: JPG, PNG</span>

          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/jpeg,image/png"
            onChange={(e) => validateAndSetFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className={styles.uploadPreviewRow}>
          <img src={previewUrl} alt="Scan preview" className={styles.uploadPreviewImage} />

          <div className={styles.uploadPreviewInfo}>
            <p className={styles.uploadFileName}>{file.name}</p>
            <p className={styles.uploadFileMeta}>{formatFileSize(file.size)}</p>

            <p className={styles.uploadTargetDoctor}>
              {selectedDoctorId
                ? `Send scan to Dr. ${selectedDoctorName}`
                : "Select a doctor before starting the analysis"}
            </p>

            {status === "uploading" && (
              <div className={styles.progressBarTrack}>
                <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
                <span className={styles.progressBarLabel}>{progress}%</span>
              </div>
            )}
          </div>

          <div className={styles.uploadActions}>
            {status === "uploading" ? (
              <button type="button" className={styles.secondaryBtn} onClick={handleCancelUpload}>
                Cancel
              </button>
            ) : (
              <>
                <button type="button" className={styles.secondaryBtn} onClick={resetSelection}>
                  Remove
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleSubmit}
                  disabled={!selectedDoctorId}
                >
                  Send to Dr. {selectedDoctorName}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {(status === "invalid" || status === "error") && errorMessage && (
        <p className={styles.uploadErrorText} role="alert">{errorMessage}</p>
      )}
    </section>
  );
}
