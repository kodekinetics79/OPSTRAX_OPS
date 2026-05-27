const EmptyState = ({ icon: Icon, title, subtitle, action, className = "" }) => {
  return (
    <div className={`text-center py-12 bg-white/5 rounded-[20px] border border-dashed border-white/10 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-sm">
          {Icon ? <Icon size={24} className="text-soft-gray" /> : null}
        </div>
        <h2 className="text-lg font-extrabold text-white tracking-tight">{title}</h2>
        {subtitle ? <p className="text-sm text-soft-gray/50 font-semibold">{subtitle}</p> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
};

export default EmptyState;
