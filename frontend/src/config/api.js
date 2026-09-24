/**
 * Centralized API Configuration
 * Reads VITE_API_BASE_URL from environment variables,
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

// Seamless tunnel header support (bypasses reminder pages on free tunnels)
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async (resource, config = {}) => {
    const headers = new Headers(config.headers || {});
    headers.set("Bypass-Tunnel-Reminder", "true");
    return originalFetch(resource, { ...config, headers });
  };
}
