export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  return initials.toUpperCase();
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const shortScanId = (id) => {
  if (!id) return "—";
  return `#${id.slice(-8).toUpperCase()}`;
};

export const friendlyErrorMessage = (err, fallback) => {
  if (!err?.response) {
    return "Network error. Please check your connection and try again.";
  }
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return fallback || "Something went wrong. Please try again.";
};
