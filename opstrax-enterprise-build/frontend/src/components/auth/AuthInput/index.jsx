import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

const Input = ({
  label,
  name,
  readOnly,
  placeholder,
  type,
  value,
  onChange,
  error,
  touched,
  isPassword,
  maxLength,
  eyeColor,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div className="relative w-full">
      <label className=" text-sm ml-2 urbanist font-medium">{label}</label>
      <div className="flex items-center ">
        <input
          name={name}
          readOnly={readOnly}
          type={showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={`w-full text-md px-4 py-3 rounded-full text-black bg-[#dedede]  focus:outline-none ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute cursor-pointer right-3"
          >
            {showPassword ? (
              <Eye color={eyeColor} size={20} />
            ) : (
              <EyeOff color={eyeColor} size={20} />
            )}
          </button>
        )}
      </div>
      {error && touched && (
        <div className="text-red-500 text-sm mt-1 ml-3 font-medium text-[12px]">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
