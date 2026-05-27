import { Plus } from "lucide-react";

const PremiumHeader = ({
  icon: Icon,
  title,
  subtitle,
  gradient, // ignored in new design
  onAddClick,
  actions,
  buttonLabel = "Create New",
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-1 mb-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-primary shadow-[0_0_10px_rgba(240,249,65,0.1)]">
              <Icon size={20} />
            </div>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-white m-0">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-soft-gray/60 text-xs font-bold uppercase tracking-widest mt-1 ml-1">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex gap-3 self-end sm:self-auto">
        {actions}
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-primary text-dark-bg px-5 py-2.5 rounded-xl font-extrabold shadow-[0_0_15px_rgba(240,249,65,0.4)] hover:shadow-[0_0_25px_rgba(240,249,65,0.6)] hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} />
            <span>{buttonLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PremiumHeader;
