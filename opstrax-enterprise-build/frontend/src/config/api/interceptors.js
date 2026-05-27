import { storage } from "../storage/index.js";
// import { appStore } from '@store/index';

export function attachInterceptors(client, config) {
  // ---- REQUEST INTERCEPTOR ----
  client.interceptors.request.use(
    async (request) => {
      const token = storage.getToken();

      if (token) {
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${token}`;
      }

      // ---- Handling FormData ----
      if (request.data instanceof FormData) {
        // If the request body is FormData, do not set Content-Type
        delete request.headers["Content-Type"]; // Let axios set the proper Content-Type for FormData
      } else {
        // If not FormData, set Content-Type as JSON
        request.headers["Content-Type"] = "application/json";
      }

      return request;
    },
    (error) => Promise.reject(error),
  );

  // ---- RESPONSE INTERCEPTOR ----
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const fullError = error?.response;
      const message =
        error?.response?.data?.data?.error ||
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      // IMPORTANT: reject with Error, not string
      return Promise.reject({ fullError, message });
    },
  );
}
