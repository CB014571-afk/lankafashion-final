import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ no localhost here
  withCredentials: true,
});

// TEMP: verify at runtime which baseURL your build is using
console.log("API baseURL =", import.meta.env.VITE_API_URL);

export default API;
