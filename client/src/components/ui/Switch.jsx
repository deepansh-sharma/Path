import React from 'react';
import { cn } from '../../utils/cn';

const Switch = React.forwardRef(({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
  ...props
}, ref) => {
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
        ref={ref}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className
        )}
        onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </div>
    </div>
  );
});

Switch.displayName = 'Switch';

export { Switch };
export default Switch;