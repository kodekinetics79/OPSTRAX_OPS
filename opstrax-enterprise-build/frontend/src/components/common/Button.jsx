import { forwardRef, useState } from "react";
import { Loader } from "lucide-react";

/*
 * Button
 * A reusable button component with:
 * - Lucide icon support
 * - Loading state
 * - Icon-only buttons
 * - Multiple variants & sizes
 */

const Button = forwardRef(
  (
    {
      children,
      icon: Icon,
      imageIcon,
      hoverImageIcon,
      iconPosition = "left",
      iconOnly = false,
      iconRotate = false,
      variant = "gradient",
      size = "md",
      fullWidth = false,
      disabled = false,
      as: Component = "button",
      loading = false,
      className = "",
      ...props
    },
    ref,
  ) => {
    // hover state
    const [isHovered, setIsHovered] = useState(false);
    /**
     * Base styles shared by all buttons
     */
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-[14px] font-bold transition-all duration-200 active:scale-95 disabled:active:scale-100 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 focus:ring-offset-dark-bg";

    /**
     * Padding & font sizes by button size
     */
    const sizeStyles = {
      sm: "px-4 py-0.5 text-sm",
      md: "px-6 py-1 text-sm",
      lg: "px-8 py-2 text-base",
    };

    /**
     * Button variants
     */
    const variantStyles = {
      primary: "bg-primary text-black-fixed hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(240,249,65,0.4)] focus:ring-primary/50 font-extrabold",
      gradient:
        "bg-primary text-black-fixed hover:bg-primary/90 focus:ring-primary/50 font-extrabold",
      secondary: "bg-primary/5 text-text-main hover:bg-primary/10 border border-border-subtle",
      outline:
        "bg-transparent border-2 border-border-subtle text-text-main hover:border-primary hover:text-primary focus:ring-primary",
      danger: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 focus:ring-rose-500",
      text: " bg-transparent text-primary hover:underline hover:opacity-70 focus:ring-0! focus:ring-offset-0!",
    };

    /**
     * Icon sizes mapped to button size
     */
    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    /**
     * Final composed class string
     */
    const buttonStyles = `
            ${baseStyles}
            ${sizeStyles[size]}
            ${variantStyles[variant]}
            ${fullWidth ? "w-full" : "w-fit"}
            ${iconOnly ? "px-2 py-2 rounded-full" : "rounded-full"}
            ${className}
        `;

    /**
     * Render Lucide icon
     */
    const renderIcon = () => {
      if (!Icon) return null;

      // Add rotation if iconRotate prop is true
      const rotateClass = iconRotate ? "-rotate-45" : "";

      return (
        <Icon className={`${iconSizes[size]} ${rotateClass}`} aria-hidden />
      );
    };
    // Render Image as icon
    const renderImageIcon = () => {
      const src = isHovered && hoverImageIcon ? hoverImageIcon : imageIcon;
      if (!imageIcon) return null;

      return (
        <img
          src={src}
          alt=""
          className={`${iconSizes[size]} object-contain w-6 h-6 transition-all`}
          aria-hidden
        />
      );
    };

    /**
     * Loading spinner
     */
    const renderSpinner = () => (
      <Loader className={`animate-spin ${iconSizes[size]}`} aria-hidden />
    );

    /**
     * Determines button content
     * Priority:
     * 1. Loading
     * 2. Icon-only
     * 3. Icon + text
     */
    const renderContent = () => {
      if (loading) return renderSpinner();

      if (iconOnly) return Icon ? renderIcon() : renderImageIcon();

      return (
        <>
          {(Icon || imageIcon) &&
            iconPosition === "left" &&
            (Icon ? renderIcon() : renderImageIcon())}

          {children && <span>{children}</span>}

          {(Icon || imageIcon) &&
            iconPosition === "right" &&
            (Icon ? renderIcon() : renderImageIcon())}
        </>
      );
    };

    return (
      <Component
        ref={ref}
        className={buttonStyles}
        /**
         * Disable only when rendered as native <button>
         */
        disabled={Component === "button" ? disabled || loading : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        /**
         * Accessibility: communicates loading state
         */
        aria-busy={loading}
        {...props}
      >
        {renderContent()}
      </Component>
    );
  },
);

export default Button;
