import { EllipsisVertical } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

/**
 * Dropdown Component
 *
 * Props:
 * - options: { label, value }[]
 * - onSelect: (value) => void
 * - menuDots: boolean
 */
const Dropdown = ({ options = [], onSelect, menuDots = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onSelect?.(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`
          absolute z-50 mt-2 min-w-[200px] 
          bg-card-dark rounded-2xl border border-border-subtle 
          shadow-xl shadow-black/50
          animate-in fade-in zoom-in-95 duration-200
          overflow-hidden
          ${align === "right" ? "right-0" : "left-0"}
        `}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3
                transition-colors duration-150
                ${
                  item.danger
                    ? "text-rose-400 hover:bg-rose-500/10"
                    : "text-text-dim hover:text-text-main hover:bg-primary/5"
                }
                ${index !== items.length - 1 ? "border-b border-border-subtle" : ""}
              `}
            >
              {item.icon && <item.icon size={16} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
