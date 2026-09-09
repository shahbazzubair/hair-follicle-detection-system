import axios from "axios";

export const API_BASE_URL = "http://localhost:8000";

export const assetUrl = (path) => (path ? `${API_BASE_URL}${path}` : "");

export const getAllDoctors = () =>
  axios.get(`${API_BASE_URL}/api/doctor/all-doctors`);

export const getPatientData = (username) =>
  axios.get(`${API_BASE_URL}/api/patient/data/${encodeURIComponent(username)}`);

export const uploadScan = (formData, onUploadProgress) =>
  axios.post(`${API_BASE_URL}/api/patient/upload-scan`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
