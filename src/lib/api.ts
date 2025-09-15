import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});

// Add token dynamically before each request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 403 Forbidden error (token expired)
    if (error.response?.status === 403) {
      // Clear the expired token
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      
      // Show toast message
      toast.error("Token is expired. Please login again.");
      
      // Redirect to login page after 3 seconds delay
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    }
    
    // Handle network errors
    if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
      console.error("Backend not reachable. Make sure server is running.");
      toast.error("Backend not reachable at the moment. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default api;
