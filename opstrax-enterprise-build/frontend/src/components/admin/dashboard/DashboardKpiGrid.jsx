import { CheckCircle, Package, Truck, UserCheck } from "lucide-react";
import { InfoCard } from "@/components";

export const DashboardKpiGrid = () => {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-6">
      <InfoCard
        icon={CheckCircle}
        label="On-Time Deliveries"
        value="98.5%"
        variant="highlight"
        trend="up"
        trendValue="+2.4%"
      />
      <InfoCard
        icon={Package}
        label="Total Deliveries"
        value="1,248"
        variant="default"
        trend="up"
        trendValue="+12.5%"
      />
      <InfoCard
        icon={Truck}
        label="Total Vehicles"
        value="482"
        variant="default"
        trend="up"
        trendValue="+5.2%"
      />
      <InfoCard
        icon={UserCheck}
        label="Driver Behavior Score"
        value="94/100"
        variant="default"
        trend="down"
        trendValue="-1.2%"
      />
    </div>
  );
};
