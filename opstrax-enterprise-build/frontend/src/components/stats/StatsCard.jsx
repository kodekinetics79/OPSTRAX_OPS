import { InfoCard } from "@/components";

const StatsCard = ({ icon, label, value, variant = "default", trend, trendValue }) => {
  return (
    <InfoCard
      icon={icon}
      label={label}
      value={value}
      variant={variant}
      trend={trend}
      trendValue={trendValue}
    />
  );
};

export default StatsCard;
