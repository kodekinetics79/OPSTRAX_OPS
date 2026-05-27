import { useState, useMemo, isValidElement } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

/**
 * Base styles shared by all input types
 */
const baseInputClass =
  "w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all duration-200 bg-dark-bg text-text-main focus:border-primary/50 focus:bg-dark-bg hover:border-border-subtle/50";

/**
 * Reusable Input Component
 * ... (rest of comments)
 */
const CustomInput = ({
  // ... props
  label,
  required = false,
  type = "text",
  placeholder = "",
  readOnly = false,
  options = [],
  name,
  value,
  onChange,
  onBlur,
  error,
  maxLength,
  rows = 4,
  className = "",
  isOpen,
  setOpenDropdown,
  showPasswordToggle = false,
  icon,
  iconPosition = "right",
  onIconClick,
}) => {
  // ... state logic
  const [inputType, setInputType] = useState(type);
  const [localOpen, setLocalOpen] = useState(false);
  const isControlledSelect = typeof setOpenDropdown === "function";
  const open = isControlledSelect ? isOpen : localOpen;
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  // ... handlers
  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value } });
    if (!readOnly) {
      if (isControlledSelect) {
        setOpenDropdown(null);
      } else {
        setLocalOpen(false);
      }
    }
  };

  const toggleDropdown = () => {
    if (readOnly) return;
    if (isControlledSelect) {
      setOpenDropdown(isOpen ? null : name);
    } else {
      setLocalOpen((prev) => !prev);
    }
  };

  const togglePassword = () => {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
  };

  const formatCanadianPhone = (value) => {
    if (!value) return;
    const digits = value?.replace(/\D/g, "")?.slice(0, 10);
    const area = digits.slice(0, 3);
    const middle = digits.slice(3, 6);
    const last = digits.slice(6, 10);
    if (digits.length <= 3) return area;
    if (digits.length <= 6) return `(${area}) ${middle}`;
    return `(${area}) ${middle}-${last}`;
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    if (digitsOnly.length <= 10) {
      onChange({
        target: { name, value: digitsOnly ? `+1${digitsOnly}` : "" },
      });
    }
  };

  const inputStyles = `
    ${baseInputClass}
    ${error ? "border-rose-500/50" : "border-border-subtle"}
    ${readOnly ? "bg-primary/5 cursor-not-allowed opacity-60" : ""}
    ${className}
  `;

  return (
    <div className="mb-4 w-full">
      {/* Label */}
      {label && (
        <label className="block mb-1.5 text-xs font-bold text-text-dim/70 uppercase tracking-wide">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}

      {/* SELECT INPUT */}
      {type === "select" && (
        <div className="relative">
          <button
            type="button"
            onClick={toggleDropdown}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-required={required}
            className={`${inputStyles} flex items-center justify-between ${readOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={readOnly}
          >
            <span className="text-left">
              {selectedOption?.label || (
                <span className="text-text-dim/60">
                  {placeholder || "Select"}
                </span>
              )}
            </span>

            <ChevronDown
              size={18}
              className={`text-text-dim/50 transition-transform ${open ? "rotate-180 text-primary" : ""}`}
            />
          </button>

          {open && (
            <ul
              role="listbox"
              className="absolute z-50 mt-1 w-full bg-card-dark border border-border-subtle rounded-xl shadow-xl p-1 max-h-48 overflow-y-auto custom-scrollbar"
            >
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    value === opt.value 
                      ? "bg-primary text-black-fixed font-bold" 
                      : "text-text-dim hover:bg-primary/5 hover:text-text-main"
                  }`}
                  role="option"
                  aria-selected={value === opt.value}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* TEXTAREA */}
      {type === "textarea" && (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          required={required}
          className={`${inputStyles} resize-none custom-scrollbar`}
        />
      )}

      {/* PHONE INPUT */}
      {type === "tel" && (
        <div className={`${inputStyles} flex items-center gap-2 px-3`}>
          <span className="text-sm text-text-dim/50">+1</span>
          <span className="h-4 w-px bg-border-subtle" />
          <input
            type="tel"
            name={name}
            value={formatCanadianPhone(value?.replace(/^\+1/, "") || "")}
            onChange={handlePhoneChange}
            onBlur={onBlur}
            readOnly={readOnly}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            className="w-full outline-none bg-transparent text-text-main"
          />
        </div>
      )}

      {/* DEFAULT INPUT */}
      {type !== "select" && type !== "textarea" && type !== "tel" && (
        <div className="relative">
          <input
            type={showPasswordToggle ? inputType : type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            readOnly={readOnly}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            className={`${inputStyles} ${
              icon && iconPosition === "right" ? "pr-10" : ""
            } ${icon && iconPosition === "left" ? "pl-10" : ""}`}
          />

          {/* LEFT ICON */}
          {icon && iconPosition === "left" && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim/50">
              {isValidElement(icon) ? icon : <icon size={18} />}
            </span>
          )}

          {/* RIGHT ICON */}
          {icon && iconPosition === "right" && !showPasswordToggle && (
            <button
              type="button"
              onClick={onIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim/50 hover:text-text-main transition-colors"
            >
              {isValidElement(icon) ? icon : <icon size={18} />}
            </button>
          )}

          {/* PASSWORD TOGGLE */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim/50 hover:text-text-main transition-colors"
            >
              {inputType === "password" ? (
                <Eye size={18} />
              ) : (
                <EyeOff size={18} />
              )}
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-rose-400"></span>
        {error}
      </p>}
    </div>
  );
};

export default CustomInput;
