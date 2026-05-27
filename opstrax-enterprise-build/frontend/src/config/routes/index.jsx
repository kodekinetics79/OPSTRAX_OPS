import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import {
  AdminLayout,
  AuthLayout,
  HrLayout,
  FinanceLayout,
  EmployeeLayout,
  SupervisorLayout,
} from "@/layout/index";
import { _images } from "@/assets/index";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const SplashScreen = () => (
  <div className="w-full bg-no-repeat h-screen flex items-center justify-center">
    <div className="w-auto">
      <img
        src={_images.logo}
        alt="App Logo"
        className="w-full h-full object-cover animate-spin"
      />
    </div>
  </div>
);

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function Root() {
  const { splashLoading, isAuthenticated, role } = useAuthContext();

  const roleHomeMap = {
    admin: "/admin",
    hr: "/hr",
    finance: "/finance",
    employee: "/employee",
    supervisor: "/supervisor",
  };

  if (splashLoading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* Public landing + redirect logged-in users */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? roleHomeMap[role] || "/admin" : "/auth/login"}
            replace
          />
        }
      />

      {/* Auth pages - redirect if already logged in */}
      <Route
        path="/auth/*"
        element={
          isAuthenticated ? (
            <Navigate to={roleHomeMap[role] || "/admin"} replace />
          ) : (
            <AuthLayout />
          )
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* HR routes */}
      <Route
        path="/hr/*"
        element={
          <ProtectedRoute allowedRoles={["hr"]}>
            <HrLayout />
          </ProtectedRoute>
        }
      />

      {/* Finance routes */}
      <Route
        path="/finance/*"
        element={
          <ProtectedRoute allowedRoles={["finance"]}>
            <FinanceLayout />
          </ProtectedRoute>
        }
      />

      {/* Employee routes */}
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      />

      {/* Supervisor routes */}
      <Route
        path="/supervisor/*"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <SupervisorLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
