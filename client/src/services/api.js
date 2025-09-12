import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // use env var, no localhost hardcode
  withCredentials: true,
});

export default API;
