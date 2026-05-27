import { useContext, createContext, useState } from "react";
import { toast } from "react-toastify";
import { storage } from "@/config/storage";

// ---------------------------
// Initial auth state
// ---------------------------
const initialAuthState = {
  isAuthenticated: true, // user is logged out by default
  role: "admin", // user role: admin/hr/finance/employee/supervisor
  user: null, // user profile data
  token: null, // auth token
  splashLoading: false, // true while checking auth/loading profile
};

// ---------------------------
// Create context
// ---------------------------
const AuthContext = createContext(initialAuthState);

// ---------------------------
// AuthProvider component
// Wrap your app with this to provide auth state/actions
// ---------------------------
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState); // main auth state

  // ---------------------------
  // Simple role-based login
  // Uses static emails to map to roles
  // ---------------------------
  const login = async ({ email, password }) => {
    if (!email) {
      toast.error("Email is required");
      return { success: false };
    }

    // Map email to role
    let role = null;
    switch (email.toLowerCase()) {
      case "admin@mail.com":
        role = "admin";
        break;
      case "hr@mail.com":
        role = "hr";
        break;
      case "finance@mail.com":
        role = "finance";
        break;
      case "employee@mail.com":
        role = "employee";
        break;
      case "supervisor@mail.com":
        role = "supervisor";
        break;
      default:
        role = null;
    }

    if (!role) {
      toast.error("Invalid credentials");
      return { success: false };
    }

    // We don't enforce any specific password here ("password can be anything")

    const user = { email, role };

    setAuthState({
      isAuthenticated: true,
      role,
      user,
      token: null,
      splashLoading: false,
    });

    toast.success("Login successful");

    return { success: true, role };
  };
  // ---------------------------
  // Logout function
  // Clears storage and resets auth state
  // ---------------------------
  const logout = async () => {
    storage.removeToken(); // remove auth token
    setAuthState({ ...initialAuthState, splashLoading: false }); // reset auth state
    toast.success("Logged out successfully");
  };

  // ---------------------------
  // Provide context values
  // ---------------------------
  return (
    <AuthContext.Provider
      value={{
        ...authState, // spread current auth state
        setAuthState, // setter for manual updates if needed
        login, // simple role-based login
        logout, // logout function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------
// Custom hook to access AuthContext
// ---------------------------
export const useAuthContext = () => useContext(AuthContext);
