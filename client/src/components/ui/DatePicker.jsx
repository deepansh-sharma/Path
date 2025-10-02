import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  className,
  disabled = false,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    onChange?.(newDate);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} {...props}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-gray-500"
        )}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {value ? formatDate(value) : placeholder}
        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full">
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg">
            <input
              type="date"
              value={value || ''}
              onChange={handleDateChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export { DatePicker };
export default DatePicker;