import { ArrowUpRight } from "lucide-react";

/**
 * InfoCard Component - Professional Design
 * Clean, minimalist, and high-contrast for enterprise dashboards
 */
const InfoCard = ({
    label,
    value,
    icon: Icon,
    className = "",
    action,
    variant = "default",
    trend,
    trendValue,
}) => {
    const variants = {
        default: {
            bg: "bg-card-dark",
            iconBg: "bg-primary/10",
            iconColor: "text-text-dim",
            border: "border-border-subtle/30",
            gradient: "from-primary/10 to-primary/5",
        },
        primary: {
            bg: "bg-card-dark",
            iconBg: "bg-primary/15",
            iconColor: "text-primary",
            border: "border-primary/10",
            gradient: "from-primary/20 to-primary/5",
        },
        highlight: {
            bg: "bg-primary",
            iconBg: "bg-black-fixed/10",
            iconColor: "text-black-fixed",
            border: "border-transparent",
            textColor: "text-black-fixed",
            labelColor: "text-black-fixed/70",
            gradient: "from-black-fixed/10 to-fade-fixed/5",
        },
        success: {
            bg: "bg-card-dark",
            iconBg: "bg-emerald-500/15",
            iconColor: "text-emerald-500",
            border: "border-emerald-500/10",
            gradient: "from-emerald-500/20 to-emerald-500/5",
        },
        warning: {
            bg: "bg-card-dark",
            iconBg: "bg-amber-500/15",
            iconColor: "text-amber-500",
            border: "border-amber-500/10",
            gradient: "from-amber-500/20 to-amber-500/5",
        },
    };

    const currentVariant = variants[variant] || variants.default;
    const isHighlight = variant === "highlight";

    return (
        <div
            className={`
        group relative overflow-hidden
        ${currentVariant.bg} ${currentVariant.border}
        rounded-[22px] p-6 border
        shadow-sm hover:shadow-xl hover:border-primary/30
        hover:-translate-y-1
        transition-all duration-400 ease-out
        ${className}
      `}
        >
            {/* Subtle radial glow on hover */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            <div className="relative flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className={`
                        ${currentVariant.iconBg} ${currentVariant.iconColor}
                        p-3.5 rounded-2xl bg-linear-to-br ${currentVariant.gradient}
                        transition-all duration-500 group-hover:rotate-6 group-hover:scale-110
                    `}>
                        {Icon && <Icon size={28} strokeWidth={2.5} />}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                        <ArrowUpRight size={18} className={isHighlight ? "text-dark-bg" : "text-primary/50"} />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${isHighlight ? "text-dark-bg/60" : "text-text-dim/40"}`}>
                        {label}
                    </p>
                    <div className={`text-3xl font-extrabold tracking-tight ${isHighlight ? "text-dark-bg" : "text-text-main"}`}>
                        {value || "—"}
                    </div>
                </div>

                {trend && (
                    <div className="pt-2">
                        <div className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black
                            ${isHighlight 
                                ? "bg-black-fixed/10 text-black-fixed" 
                                : trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            }
                        `}>
                            <span className="text-xs">{trend === "up" ? "↑" : "↓"}</span>
                            <span>{trendValue}</span>
                            <span className="opacity-50 font-bold ml-0.5">VS LAST MONTH</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoCard;
