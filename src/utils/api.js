import axios from "axios";
import API_URL from "../config";

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
