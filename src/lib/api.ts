import type { ApiErrorResponse } from "@/types/api";
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.BASE_URL,
  headers: {
    "Content-Type": "application/json", // what we are sending
    Accept: "application/json", // what we are willing to receive back
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const bearerToken = localStorage.getItem("bearerToken");

    if (bearerToken) {
      config.headers.Authorization = `Bearer ${bearerToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // laravel send back the error
      const currentPath = window.location.pathname;
      if (error.response.status === 401 && currentPath !== "/login") {
        localStorage.removeItem("bearerToken");
        localStorage.removeItem("user");
        window.location.href = "/login";

        // for 401, we dont want the catch block at component to run
        return new Promise(() => {});
      }
      return Promise.reject(error.response.data);
    } else {
      // server down error
      const networkError: ApiErrorResponse = {
        success: false,
        message: "Network error. Please check your connection.",
        errors: null,
      };

      return Promise.reject(networkError);
    }
  }
);

export default apiClient;
