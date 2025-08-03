import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // and route is not already the login page
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/auth/signin"
    ) {
      useAuthStore.getState().logout();
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  }
);

export default api;
