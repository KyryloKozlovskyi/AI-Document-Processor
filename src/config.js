// Configuration for API endpoints
const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:5000");

export default API_URL;
