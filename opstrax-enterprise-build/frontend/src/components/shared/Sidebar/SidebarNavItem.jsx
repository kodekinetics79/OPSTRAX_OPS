import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const SidebarNavItem = ({ item, currentPath, onClose, isCollapsed }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const itemRef = useRef(null);

  const rootOnlyRoutes = ["/instructor", "/admin", "/user"];
  const isActive =
    currentPath === item.link ||
    (!rootOnlyRoutes.includes(item.link) &&
      currentPath.startsWith(`${item.link}/`));

  const Icon = item.icon;

  const handleMouseEnter = () => {
    if (!isCollapsed) return;
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12, // 12px gap
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Close tooltip on scroll or route change
  useEffect(() => {
    setShowTooltip(false);
  }, [currentPath]);

  return (
    <>
      <div 
        ref={itemRef}
        className="relative group p-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          onClick={onClose}
          to={item.link}
          className={`
            flex items-center rounded-full transition-all duration-300 outline-none
            ${isCollapsed ? "justify-center w-10 h-10 mx-auto" : "px-4 py-3 gap-3 w-full"}
            ${
              isActive
                ? "bg-primary text-black-fixed font-bold shadow-[0_0_15px_rgba(240,249,65,0.4)] scale-105"
                : "text-text-dim hover:bg-primary/10 hover:text-text-main hover:scale-105"
            }
          `}
        >
          <div className={`flex items-center justify-center ${isCollapsed ? "" : "w-5"}`}>
            {Icon && (
              <Icon 
                size={isCollapsed ? 20 : 18} 
                className={`transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-110"}`} 
              />
            )}
          </div>

          {!isCollapsed && (
            <span className="text-sm font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              {item.name}
            </span>
          )}
        </Link>
      </div>

      {/* Portal Tooltip */}
      {showTooltip && isCollapsed && createPortal(
        <div 
          className="
            fixed z-9999 pointer-events-none
            flex items-center animate-fade-in
          "
          style={{ 
            top: tooltipPos.top, 
            left: tooltipPos.left,
            transform: 'translateY(-50%)' 
          }}
        >
          {/* Arrow */}
          <div className="absolute -left-1.5 w-3 h-3 bg-card-dark border-l border-b border-border-subtle rotate-45 transform rounded-bl-sm"></div>
          
          {/* Tooltip Body */}
          <div className="
            px-4 py-2 
            bg-card-dark backdrop-blur-md border border-border-subtle 
            text-text-main text-xs font-bold whitespace-nowrap rounded-xl 
            shadow-[0_4px_20px_rgba(0,0,0,0.5)]
            flex items-center gap-2
          ">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(240,249,65,0.8)]"></div>
            {item.name}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SidebarNavItem;
