import {
  DashboardKpiGrid,
  DashboardOperationsPanel,
} from "@/components";

const AdminDashboard = () => {
  return (
    <div className="w-full space-y-6 pb-10 animate-fade-in">
      <DashboardKpiGrid />
      <DashboardOperationsPanel />
    </div>
  );
};

export default AdminDashboard;
