import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5050/api", // <-- set correct backend port
  withCredentials: true,
});

export default API;