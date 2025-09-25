import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({ 
  checked = false, 
  onCheckedChange, 
  disabled = false, 
  className = "",
  id,
  ...props 
}) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={`w-4 h-4 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${
          checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-300 hover:border-gray-400'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
      >
        {checked && (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        )}
      </div>
    </div>
  );
};