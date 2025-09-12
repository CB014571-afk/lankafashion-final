import axios from "axios";

// Read env (Vite only exposes vars that start with VITE_)
const raw = (import.meta.env.VITE_API_BASE_URL || "https://lankafashion-final.onrender.com").trim();

// Ensure the base URL ends with `/api`
function ensureApi(url) {
  const noTrail = url.replace(/\/+$/, "");   // remove trailing slash(es)
  return noTrail.endsWith("/api") ? noTrail : `${noTrail}/api`;
}

const baseURL = ensureApi(raw);
console.log("🔎 API baseURL =", baseURL); // check this in prod Console

const API = axios.create({
  baseURL, // e.g. https://lankafashion-final.onrender.com/api
  // Turn this off unless you actually use cookies/sessions:
  withCredentials: false,
});

// Safety: make sure every request path starts with a single leading slash
API.interceptors.request.use((cfg) => {
  if (cfg.url && !cfg.url.startsWith("/")) cfg.url = "/" + cfg.url;
  return cfg;
});

export default API;
