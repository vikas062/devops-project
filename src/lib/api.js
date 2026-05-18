// ─────────────────────────────────────────────────────────
// api.js — Axios API Client
//
// Auto-detects environment:
//   • Development  → uses Vite proxy at /api
//   • Production   → connects directly to Render backend
//
// Auth token is injected automatically into every request
// via the request interceptor.
// ─────────────────────────────────────────────────────────

import axios from "axios";

const api = axios.create({
  // Use VITE_API_URL if set, otherwise relative /api (nginx proxies to backend)
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
