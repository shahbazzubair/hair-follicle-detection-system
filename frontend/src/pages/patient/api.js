import axios from "axios";
import { API_BASE_URL, assetUrl } from "../../config/api";

export { API_BASE_URL, assetUrl };

export const getAllDoctors = () =>
  axios.get(`${API_BASE_URL}/api/doctor/all-doctors`);

export const getPatientData = (username) =>
  axios.get(`${API_BASE_URL}/api/patient/data/${encodeURIComponent(username)}`);

export const uploadScan = (formData, onUploadProgress) =>
  axios.post(`${API_BASE_URL}/api/patient/upload-scan`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
