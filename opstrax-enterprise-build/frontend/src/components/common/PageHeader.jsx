const PageHeader = ({ icon: Icon, title, subtitle, action, className = "" }) => {
  return (
    <div className={`bg-card-dark border border-white/5 rounded-[20px] p-8 shadow-xl relative overflow-hidden ${className}`}>
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex flex-col tablet:flex-row tablet:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(240,249,65,0.1)] border border-white/5">
            {Icon ? <Icon size={32} /> : null}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="text-soft-gray/60 font-bold uppercase tracking-widest text-[10px] mt-1">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
};

export default PageHeader;
