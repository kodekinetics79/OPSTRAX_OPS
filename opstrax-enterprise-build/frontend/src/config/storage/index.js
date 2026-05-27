export const storage = {
  getToken() {
    return localStorage.getItem("token");
  },
  setToken(token) {
    return localStorage.setItem("token", token);
  },
  removeToken() {
    return localStorage.removeItem("token");
  },
  setOtpEmail(email) {
    return localStorage.setItem("otpEmail", email);
  },
  getOtpEmail() {
    return localStorage.getItem("otpEmail");
  },
  removeOtpEmail() {
    return localStorage.removeItem("otpEmail");
  },
};