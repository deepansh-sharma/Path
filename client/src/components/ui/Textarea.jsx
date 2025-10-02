import React from 'react';

export const Textarea = ({ 
  className = "", 
  placeholder = "", 
  value, 
  onChange, 
  rows = 3,
  disabled = false,
  required = false,
  ...props 
}) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      } ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
};

export default Textarea;