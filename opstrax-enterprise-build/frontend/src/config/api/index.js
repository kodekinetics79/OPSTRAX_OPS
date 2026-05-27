import { baseUrl } from "@/constants/index";
import { createApiClient } from "./axios";

export const client = createApiClient({
  baseURL: baseUrl,
  // customHeaders,
  onUnauthorized: () => {
    // navigate('Login'); // optional
  },
});
