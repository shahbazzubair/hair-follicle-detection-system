/**
 * Centralized API Configuration
 * Reads VITE_API_BASE_URL from environment variables (e.g. Hugging Face Space URL in production),
 * with a fallback to local backend on http://localhost:8000.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

/**
 * Resolves an asset path to a full URL
 */
export const assetUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
