import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ChevronDown, LogOut, Settings, User, ShieldCheck } from "lucide-react";

/**
 * ProfileDropdown Component - "Latest Vision" Redesign
 * Features solid depth, bento-style menu, and premium typography
 */
const ProfileDropdown = () => {
  const dropdownRef = useRef();
  const { logout, user } = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className={`
          flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl transition-all duration-300
          ${showDropdown ? "bg-primary/10" : "hover:bg-primary/5"}
        `}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-border-subtle shadow-md">
            <img
              src={user?.avatar?.url || "https://placehold.co/100x100"}
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card-dark shadow-sm" title="Online" />
        </div>

        <div className="hidden phone:flex flex-col items-start">
          <span className="text-sm font-bold text-text-main leading-tight">
            {user?.name || "Sophia"}
          </span>
          <span className="text-[10px] font-bold text-text-dim/50 uppercase tracking-widest">
            {user?.role || "Administrator"}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-text-dim transition-transform duration-300 ${showDropdown ? "rotate-180 text-text-main" : ""}`}
        />
      </button>

      {/* Modern Bento Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-card-dark rounded-[24px] p-3 shadow-2xl border border-border-subtle animate-fade-in-down">
          {/* User Preview Tile */}
          <div className="p-4 mb-2 bg-primary/5 rounded-[20px] border border-border-subtle flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_10px_rgba(240,249,65,0.1)] shrink-0 border border-primary/20">
              <ShieldCheck size={24} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-bold text-text-main truncate">Verified Account</p>
              <p className="text-[11px] text-text-dim/50 font-medium truncate">{user?.email || "admin@aifleet.com"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl text-text-dim hover:bg-primary/5 hover:text-text-main transition-all group"
              onClick={() => setShowDropdown(false)}
            >
              <div className="p-2 rounded-lg bg-primary/5 border border-border-subtle group-hover:border-primary/30 group-hover:text-primary transition-all">
                <User size={18} />
              </div>
              <span className="text-sm font-bold">My Profile</span>
            </button>

            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl text-text-dim hover:bg-primary/5 hover:text-text-main transition-all group"
              onClick={() => setShowDropdown(false)}
            >
              <div className="p-2 rounded-lg bg-primary/5 border border-border-subtle group-hover:border-primary/30 group-hover:text-primary transition-all">
                <Settings size={18} />
              </div>
              <span className="text-sm font-bold">Account Settings</span>
            </button>

            <div className="h-px bg-border-subtle my-2 mx-2" />

            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all group"
            >
              <div className="p-2 rounded-lg bg-primary/5 border border-border-subtle group-hover:border-rose-500/30 group-hover:text-rose-500 transition-all">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
