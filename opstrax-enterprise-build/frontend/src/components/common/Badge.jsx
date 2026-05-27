const variants = {
  default: "bg-text-secondary/10 text-text-primary border-border-subtle",
  primary: "bg-primary/20 text-primary border-primary/20",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/20 text-rose-400 border-rose-500/20",
  info: "bg-sky-500/20 text-sky-400 border-sky-500/20",
  neon: "bg-primary text-[#000000] border-transparent font-extrabold shadow-[0_0_10px_rgba(240,249,65,0.4)]",
};

const sizes = {
  sm: "text-[10px] px-2 py-1 rounded-lg",
  md: "text-xs px-3 py-1.5 rounded-xl",
  lg: "text-sm px-4 py-2 rounded-2xl",
};

const Badge = ({ children, variant = "default", size = "sm", className = "" }) => {
  const v = variants[variant] || variants.default;
  const s = sizes[size] || sizes.sm;
  return <span className={`font-bold border ${v} ${s} ${className}`}>{children}</span>;
};

export default Badge;
