import { endpoints } from "../endpoints.js";
import { client } from "../index.js";

export const authApi = {
  async loginUser(body) {
    return await client.post(endpoints.auth.login, body);
  },
};
