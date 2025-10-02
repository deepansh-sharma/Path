import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const DropdownMenu = ({ children, className, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen, className, ...props }) => (
  <button
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
      "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium",
      "border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
  </button>
);

const DropdownMenuContent = ({ children, isOpen, className, ...props }) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className, ...props }) => (
  <button
    onClick={onClick}
    className={cn(
      "block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      "focus:bg-gray-100 focus:text-gray-900 focus:outline-none",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const DropdownMenuSeparator = ({ className, ...props }) => (
  <div className={cn("my-1 h-px bg-gray-200", className)} {...props} />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};

export default DropdownMenu;