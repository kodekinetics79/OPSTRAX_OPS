import axios from "axios";
import { attachInterceptors } from "./interceptors";

/**
 * Create an Axios API client with interceptors for authentication, error handling, and dynamic Content-Type management.
 * @param {Object} config - Configuration for Axios client (e.g., baseURL).
 * @returns {AxiosInstance} - The configured Axios client.
 */
export function createApiClient(config) {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      Accept: "application/json"
      // Content-Type will be set dynamically based on the request body in the interceptor
    },
    timeout: 60 * 1000, // Timeout after 60 seconds
  });

  // Attach interceptors ONCE and return the same instance
  attachInterceptors(client, config);

  return client;
}
