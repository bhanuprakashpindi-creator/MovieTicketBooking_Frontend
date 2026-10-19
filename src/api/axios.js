import axios from "axios";

const api = axios.create({
  baseURL: "https://movieticketbooking-457p.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle common API errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      console.warn("Session expired or token is invalid");

      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    }

    if (status === 403) {
      console.warn("Access denied");
    }

    if (status === 404) {
      console.warn("Resource not found");
    }

    if (status === 409) {
      console.warn("Conflict occurred");
    }

    if (status >= 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  }
);

export default api;