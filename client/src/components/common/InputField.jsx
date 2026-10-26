import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = forwardRef(function InputField(
  {
    label,
    icon: Icon,
    type = "text",
    error,
    placeholder,
    className = "",
    disabled = false,
    ...rest
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const resolvedType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {Icon && (
          <span style={{ position: "absolute", left: "12px", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
            <Icon size={18} />
          </span>
        )}
        <input
          ref={ref}
          type={resolvedType}
          disabled={disabled}
          placeholder={placeholder}
          className={`input-field ${error ? "has-error" : ""}`}
          style={{
            paddingLeft: Icon ? "2.4rem" : "0.75rem",
            paddingRight: isPasswordField ? "2.5rem" : "0.75rem",
          }}
          {...rest}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
});

export default InputField;
