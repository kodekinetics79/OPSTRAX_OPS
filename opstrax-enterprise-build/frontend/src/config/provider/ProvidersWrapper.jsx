// ==============================
// ProvidersWrapper
// ------------------------------
// This component wraps the entire application
// with all global providers like:
// - React Query
// - React Router
// - Auth Context
// - Toast Notifications
// ==============================

import Toast from "@/components/common/Toast";
import ColorPicker from "@/components/common/ColorPicker";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// ------------------------------
// React Query client configuration
// ------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, // Disable auto-retry for failed queries
      refetchOnWindowFocus: false, // Prevent refetch on tab focus
    },
  },
});

// ------------------------------
// Providers Wrapper Component
// ------------------------------
const ProvidersWrapper = ({ children }) => {
  return (
    // React Query Provider (API state management)
    <QueryClientProvider client={queryClient}>
      {/* React Router Provider */}
      <BrowserRouter>
        {/* Theme Context Provider */}
        <ThemeProvider>
          {/* Authentication Context Provider */}
          <AuthProvider>
            {/* App Routes / Components */}
            {children}
            {/* Global Toast Notifications */}
            <Toast />
            {/* Global Color Picker */}
            <ColorPicker />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default ProvidersWrapper;
