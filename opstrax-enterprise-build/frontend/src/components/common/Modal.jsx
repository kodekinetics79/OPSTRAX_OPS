import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Modal Component - Premium Design
 * Features glassmorphism backdrop, gradient accent, and spring animations
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  showCloseButton = true,
  footer,
  icon: Icon,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} 
          bg-card-dark rounded-[24px] border border-border-subtle
          shadow-2xl shadow-black/50
          max-h-[90vh] flex flex-col
          overflow-hidden
          modal-content
        `}
      >
        {/* Decorative top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-emerald-400 to-primary" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="relative flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-4">
              {/* Optional Icon */}
              {Icon && (
                <div className="p-3 rounded-xl bg-primary/5 text-primary border border-border-subtle shadow-lg shadow-black/20">
                  <Icon size={24} strokeWidth={2} />
                </div>
              )}
              <div>
                {title && (
                  <h2 className="text-xl font-bold text-text-main tracking-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-text-dim/50 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-primary/5 text-text-dim hover:text-text-main transition-all duration-200 hover:rotate-90"
              >
                <X size={20} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 pt-4 border-t border-border-subtle bg-primary/5">
            {footer}
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes backdrop-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-spring {
          0% { 
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
          100% { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .modal-backdrop {
          animation: backdrop-fade 0.25s ease-out forwards;
        }
        .modal-content {
          animation: modal-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
