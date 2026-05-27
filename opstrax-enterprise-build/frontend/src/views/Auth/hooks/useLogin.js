import { toast } from "react-toastify";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook to handle user login.
 * Integrates React Query for API calls, AuthContext for state management,
 * and localStorage (via storage) to persist token/user info.
 */
export function useLogin() {
  const navigate = useNavigate();
  const { login: ctxLogin } = useAuthContext();

  const login = async ({ email, password }) => {
    const result = await ctxLogin({ email, password });
    if (result?.success) {
      // Redirect to role home handled by Root route component on reload/redirect,
      // but we can force navigation here for immediate UX.
      const roleHomeMap = {
        admin: "/admin",
        hr: "/hr",
        finance: "/finance",
        employee: "/employee",
        supervisor: "/supervisor",
      };
      navigate(roleHomeMap[result.role] || "/admin", { replace: true });
    }
  };

  return {
    login,
    isLoading: false,
    error: null,
  };
}
