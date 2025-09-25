import axios from "axios";

// Read env (Vite exposes only VITE_*). Fallback to local development server.
const RAW = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").trim();

// Ensure final baseURL ENDS with /api (no trailing slash after it)
const ROOT = RAW.replace(/\/+$/, "");
const baseURL = ROOT.endsWith("/api") ? ROOT : `${ROOT}/api`;

const API = axios.create({
  baseURL,                           // e.g. https://lankafashion-final.onrender.com/api
  withCredentials: false,            // turn on only if you use cookies/sessions
  headers: { "Content-Type": "application/json" },
});

// --- Option B sanitizer ---
// 1) Ensure a single leading slash
// 2) If the path starts with /api, drop that first /api (since baseURL already ends with /api)
API.interceptors.request.use((cfg) => {
  if (cfg.url) {
    let u = cfg.url.toString();
    if (!u.startsWith("/")) u = "/" + u;
    u = u.replace(/^\/api(\/|$)/, "/"); // strip one leading /api
    cfg.url = u;
  }
  return cfg;
});

// (Optional) one-time debug to verify in prod
console.log("🔎 API baseURL =", API.defaults.baseURL);

// Add response interceptor to handle CORS and other errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
      console.error('🚫 CORS/Network Error:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      });
    }
    return Promise.reject(error);
  }
);

export default API;
