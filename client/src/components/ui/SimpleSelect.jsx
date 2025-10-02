import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * SimpleSelect - A select component that accepts options array and direct onChange
 * Compatible with existing usage patterns across the codebase
 */
const SimpleSelect = React.forwardRef(
  (
    {
      value,
      onChange,
      options = [],
      placeholder = "Select...",
      disabled = false,
      className = "",
      error,
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full px-3 py-2 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "appearance-none cursor-pointer",
            error && "border-red-300 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

SimpleSelect.displayName = "SimpleSelect";

export { SimpleSelect };
export default SimpleSelect;