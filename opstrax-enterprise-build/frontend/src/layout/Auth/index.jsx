import { LoginScreen } from "@/views/index";
import { Routes, Route } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="bg-(image:--color-custom-gradient) min-h-screen items-center justify-center">
      <Routes>
        <Route exact path="/login" element={<LoginScreen />} />
      </Routes>
    </div>
  );
};
