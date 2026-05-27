import { useState, useEffect } from "react";
import { SidebarNavItem } from "@/components/index";
import { ChevronDown, ChevronRight } from "lucide-react";

const SidebarCategory = ({
  category,
  pathname,
  onClose,
  isCollapsed,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-expand if a child is active
  useEffect(() => {
    const hasActiveChild = category.items.some(
      (item) => pathname === item.link || pathname.startsWith(`${item.link}/`)
    );
    // Only auto-expand if not collapsed, or we can choose to auto-expand always.
    // The previous logic was: if (hasActiveChild && !isCollapsed)
    // If the user wants collapsible categories even when collapsed, we should probably respect that.
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [pathname, category.items]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`space-y-1 ${isCollapsed ? "px-1" : "px-4"}`}>
      {/* Category Header */}
      {!isCollapsed ? (
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-extrabold text-text-dim/50 uppercase tracking-[0.15em] hover:text-primary transition-colors group mb-1"
        >
          <span className="truncate">{category.category}</span>
          <span className="text-text-dim/30 group-hover:text-primary transition-colors">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>
      ) : (
        // Collapsed Category Label - Now Clickable
        <button 
          onClick={handleToggle}
          className="w-full flex flex-col items-center justify-center py-2 group cursor-pointer"
          title={category.category}
        >
          <div className="w-full text-center text-[9px] font-extrabold text-text-dim/30 group-hover:text-primary uppercase tracking-widest truncate border-b border-border-subtle pb-1 mb-1 transition-colors">
            {category.category.slice(0, 3)}
          </div>
          {/* Optional chevron for collapsed state if needed, or just rely on items disappearing */}
        </button>
      )}

      {/* Items Container */}
      <div
        className={`
          space-y-1 overflow-hidden transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >
        {category.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            currentPath={pathname}
            onClose={onClose}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarCategory;
