import axios from "axios";

const token = localStorage.getItem("accessToken");
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "69420",
  },
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
