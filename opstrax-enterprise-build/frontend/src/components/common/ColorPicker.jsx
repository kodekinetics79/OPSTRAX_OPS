import { useState, useEffect } from "react";
import { Palette, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/**
 * ColorPicker Component
 * Fixed bottom-right color customization tool
 * Allows users to change the primary color (bg-primary)
 */
const ColorPicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#F0F941");
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";


  // Predefined color palette
  const colorPresets = [
    { name: "Neon Yellow", value: "#F0F941" },
    { name: "Electric Blue", value: "#00D9FF" },
    { name: "Cyber Purple", value: "#B026FF" },
    { name: "Neon Green", value: "#39FF14" },
    { name: "Hot Pink", value: "#FF006E" },
    { name: "Orange Glow", value: "#FF6B35" },
    { name: "Mint Fresh", value: "#00FFA3" },
    { name: "Coral Red", value: "#FF4D6D" },
  ];

  // Load saved color from localStorage on mount
  useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor");
    if (savedColor) {
      setSelectedColor(savedColor);
      applyColor(savedColor);
    }
  }, []);

  // Apply color to CSS variable
  const applyColor = (color) => {
    document.documentElement.style.setProperty("--color-primary", color);
    localStorage.setItem("primaryColor", color);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    applyColor(color);
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setSelectedColor(color);
    applyColor(color);
  };

  const resetToDefault = () => {
    const defaultColor = "#F0F941";
    setSelectedColor(defaultColor);
    applyColor(defaultColor);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50
          p-4 rounded-full
          bg-primary text-text-primary
          shadow-[0_0_20px_rgba(240,249,65,0.4)]
          hover:shadow-[0_0_30px_rgba(240,249,65,0.6)]
          hover:scale-110
          transition-all duration-300
          ${isOpen ? "rotate-180" : ""}
        `}
        aria-label="Color Picker"
      >
        {isOpen ? <X size={24} /> : <Palette size={24} />}
      </button>

      {/* Color Picker Panel */}
      {isOpen && (
        <div
          className={`
            fixed bottom-24 right-6 z-50
            w-80 premium-panel
            rounded-2xl p-6
            animate-in slide-in-from-bottom-4 duration-300
          `}
        >
          {/* Theme Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text-primary mb-1">
              Customize Theme
            </h3>
            <p className="text-xs text-text-muted">
              Select your primary color
            </p>
            <label className="block text-sm font-medium text-text-secondary mb-3 mt-4">
              Theme Mode
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  transition-all duration-200 border
                  ${theme === 'light'
                    ? 'bg-primary text-[#000000] border-primary shadow-[0_0_15px_rgba(240,249,65,0.3)]'
                    : 'bg-white/5 text-soft-gray border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <Sun size={18} />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  transition-all duration-200 border
                  ${theme === 'dark'
                    ? 'bg-primary text-[#000000] border-primary shadow-[0_0_15px_rgba(240,249,65,0.3)]'
                    : 'bg-white/5 text-soft-gray border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <Moon size={18} />
                <span className="text-sm font-medium">Dark</span>
              </button>
            </div>
          </div>

          {/* Color Presets Grid */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-soft-gray mb-3">
              Primary Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleColorChange(preset.value)}
                  className={`
                    group relative aspect-square rounded-xl
                    transition-all duration-300
                    hover:scale-110 hover:shadow-xl
                    color-swatch
                    ${
                    selectedColor === preset.value
                    ? "ring-2 ring-primary ring-offset-4 ring-offset-card scale-110"
                      : ""
                    }
                  `}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                >
                  {selectedColor === preset.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Custom Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedColor}
                onChange={handleCustomColorChange}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10 bg-transparent"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-primary/50"
                placeholder="#F0F941"
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetToDefault}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-text-secondary rounded-lg text-sm font-medium transition-all duration-200 border border-border-subtle"
          >
            Reset to Default
          </button>

          {/* Preview */}
          <div className="mt-4 p-3 bg-bg-primary rounded-lg border border-border-subtle">
            <p className="text-xs text-text-muted mb-2">Preview</p>
            <div className="flex gap-2">
              <div
                className="flex-1 h-8 rounded-md"
                style={{ backgroundColor: selectedColor }}
              />
              <div
                className="flex-1 h-8 rounded-md"
                style={{
                  backgroundColor: selectedColor,
                  opacity: 0.1,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ColorPicker;
