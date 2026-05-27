import { useLocation } from "react-router-dom";
import SidebarCategory from "./SidebarCategory";
import logo from "@/assets/logo.png";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";


const Sidebar = ({
  menuItems,
  onClose,
  isCollapsed,
  toggleCollapse,
  className = "",
}) => {
  const { pathname } = useLocation();


  return (
    <div
      className={`
        ${className} 
        bg-dark-bg border-r border-border-subtle shadow-xl 
        flex flex-col select-none relative z-50 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-72"}
        h-screen
      `}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-center h-20 mb-2 border-b border-border-subtle relative shrink-0">
        <div
          className={`transition-all duration-300 flex items-center justify-center overflow-hidden bg-primary/5 rounded-full ${
            isCollapsed ? "w-10 h-10" : "w-10 h-10 px-0"
          }`}
        >
          <img
            src={logo}
            alt="OpsTrax"
            className={`
              object-contain transition-all duration-300
              h-6 opacity-90
              brightness-0 invert
            `}
          />
        </div>
          {!isCollapsed && (
            <span className="ml-3 text-xl font-bold text-text-main tracking-tight whitespace-nowrap animate-fade-in">
              OpsTrax
            </span>
          )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col overflow-y-auto no-scrollbar py-4 space-y-6">
        {menuItems.map((category, index) => (
          <SidebarCategory
            key={category.category || index}
            category={category}
            pathname={pathname}
            onClose={onClose}
            isCollapsed={isCollapsed}
            defaultOpen={true}
          />
        ))}
      </nav>
      
      {/* Footer / Collapse Toggle */}
      <div className="p-4 border-t border-border-subtle shrink-0">
        <button
          onClick={toggleCollapse}
          className={`
            w-full flex items-center justify-center p-2 rounded-xl
            text-text-dim hover:text-text-main hover:bg-primary/5
            transition-all duration-200
            ${!isCollapsed ? "bg-primary/5" : ""}
          `}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <div className="flex items-center gap-2 w-full justify-center">
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
