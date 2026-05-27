import { SharedHeader, Sidebar } from "@/components/index";
import { roleMenuItems } from "@/constants/admin";
import { EmployeeDashboard } from "@/views/Employee";
import { useAuthContext } from "@/context/AuthContext";
import { Routes, Route } from "react-router-dom";

export const EmployeeLayout = () => {
  const { role } = useAuthContext();
  const menuItems = roleMenuItems[role] || roleMenuItems.employee || [];

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen max-h-screen overflow-hidden">
      <div className="laptop:flex hidden">
        <Sidebar menuItems={menuItems} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-4 laptop:px-8 py-4 relative">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <SharedHeader />
            <main className="w-full pb-8">
              <Routes>
                <Route path="/*" element={<EmployeeDashboard />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
