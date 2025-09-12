import axios from "axios";

// Do NOT include `/api` here.
// If the env var is missing at build time, fall back to your Render URL.
const raw = import.meta.env.VITE_API_BASE_URL || "https://lankafashion-final.onrender.com";

// remove any trailing slash
const baseURL = raw.replace(/\/+$/, "");

// Debug once: confirm in DevTools Console what the app is using in prod
console.log("🔎 API baseURL =", baseURL);

const API = axios.create({
  baseURL,            // e.g. https://lankafashion-final.onrender.com
  withCredentials: true,
});

// tiny safety: ensure request url always starts with a single leading slash
API.interceptors.request.use((cfg) => {
  if (cfg.url && !cfg.url.startsWith("/")) cfg.url = "/" + cfg.url;
  return cfg;
});

export default API;
