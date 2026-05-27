import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef}>
            {/* Notification Icon */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`relative rounded-full p-2.5 cursor-pointer transition-all duration-300 ${
                    isOpen 
                        ? "bg-primary text-dark-bg shadow-[0_0_10px_rgba(240,249,65,0.4)]" 
                        : "bg-white/5 text-soft-gray hover:bg-white/10 hover:text-white"
                }`}
            >
                <Bell size={20} />
                <div className="absolute top-2 right-2 bg-rose-500 h-2 w-2 rounded-full ring-2 ring-card-dark" />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className={`absolute right-0 top-12 w-80 bg-card-dark rounded-[20px] shadow-2xl p-4 z-50 animate-fade-in-down border border-white/10`}
                >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">3 New</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                            <p className="text-xs font-bold text-white mb-1">Shipment #8492 Delayed</p>
                            <p className="text-[10px] text-soft-gray/60">2 mins ago • Logistics</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                            <p className="text-xs font-bold text-white mb-1">Driver John Doe Arrived</p>
                            <p className="text-[10px] text-soft-gray/60">15 mins ago • Dispatch</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                            <p className="text-xs font-bold text-white mb-1">System Maintenance</p>
                            <p className="text-[10px] text-soft-gray/60">1 hr ago • System</p>
                        </div>
                    </div>
                    
                    <button className="w-full mt-3 text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors py-2">
                        View All
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
