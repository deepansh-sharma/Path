import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SelectContext = createContext();

export const Select = ({ 
  value, 
  onValueChange, 
  onChange, // alias for convenience
  children, 
  disabled = false,
  options = [], // optional options array for simple usage
  placeholder = "Select...",
  className = "",
  required = false,
  error,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef(null);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    // Support both onValueChange and onChange props
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Keep internal state in sync when value prop changes
    setSelectedValue(value || '');
  }, [value]);

  return (
    <SelectContext.Provider value={{ 
      selectedValue, 
      handleValueChange, 
      isOpen, 
      setIsOpen, 
      disabled 
    }}>
      <div ref={selectRef} className={`relative ${className}`} {...rest}>
        {/* If options provided and no custom children, render default composition */}
        {options && options.length > 0 && !children ? (
          <>
            <SelectTrigger placeholder={placeholder} required={required} error={error} />
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </>
        ) : (
          children
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className = "", placeholder = "Select...", required = false, error }) => {
  const { selectedValue, isOpen, setIsOpen, disabled } = useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={`w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 flex items-center justify-between ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
      } ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} ${className}`}
    >
      <span className={selectedValue ? 'text-gray-900' : 'text-gray-500'}>
        {/* If no custom children provided, use SelectValue to show selected or placeholder */}
        {children || <SelectValue placeholder={placeholder} />}
      </span>
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

export const SelectValue = ({ placeholder = "Select..." }) => {
  const { selectedValue } = useContext(SelectContext);
  return selectedValue || placeholder;
};

export const SelectContent = ({ children, className = "" }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}>
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children, className = "" }) => {
  const { selectedValue, handleValueChange } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      onClick={() => handleValueChange(value)}
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Select;