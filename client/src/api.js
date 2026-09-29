import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use((c) => { const t = localStorage.getItem("token"); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use((r) => r, (e) => {
  const url = e.config?.url || "";
  if (e.response?.status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) { localStorage.clear(); window.location.href = "/login"; }
  return Promise.reject(e);
});
export const errMsg = (e) => e.response?.data?.message || (e.request ? "Cannot reach the server. Check that the API is running and VITE_API_URL is correct." : e.message);
export default api;
