import axios from "axios";

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
    if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
      console.error("Backend not reachable. Make sure server is running.");
    }
    return Promise.reject(error);
  }
);

export default api;
