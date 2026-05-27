import { NotificationDropdown, ProfileDropdown } from "@/components/index";
import { Search, Sparkles, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full space-y-4 py-2 sticky top-2 z-40 select-none">
      <div className="bg-card-dark border border-white/5 rounded-3xl p-3 flex items-center justify-between shadow-xl transition-all duration-300">

        {/* Left Section: Greeting & Status */}
        <div className="flex items-center gap-4 pl-2">
          <div className="hidden desktop:flex flex-col border-r border-white/5 pr-6 mr-2">
            <h1 className="text-xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
              Hello, User <span className="text-xl">👋</span>
            </h1>
            <p className="text-[11px] text-text-dim/60 font-semibold uppercase tracking-wider">
              Fleet Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3 bg-primary/5 px-4 py-1.5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(240,249,65,0.6)]" />
              <span className="text-[13px] font-bold text-text-main/90">Fleet Live</span>
            </div>
            <div className="h-4 w-[1.5px] bg-primary/20 mx-1" />
            <div className="flex items-center gap-2 text-text-dim/60">
              <Clock size={14} />
              <span className="text-[13px] font-medium tabular-nums">{time}</span>
            </div>
          </div>
        </div>

        {/* Center Section: Enhanced Search */}
        <div className="hidden laptop:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-dim/40 group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="block w-full bg-dark-bg border-2 border-border-subtle rounded-2xl py-2.5 pl-11 pr-14 text-sm font-medium text-text-main focus:border-primary/20 focus:ring-0 transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="hidden tablet:inline-flex items-center gap-1 px-2 py-0.5 border border-border-subtle rounded-lg bg-card-dark text-[10px] font-bold text-text-dim/50 shadow-sm">
                <span className="text-xs">⌘</span> K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 pr-2">
          <div className="flex items-center gap-1 mr-2 px-2.5 rounded-2xl text-text-dim/60 hover:bg-primary/5 hover:text-text-main transition-all relative">
            <NotificationDropdown />
          </div>

          <div className="h-10 w-[1.5px] bg-border-subtle mx-1" />

          <div className="pl-2">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
