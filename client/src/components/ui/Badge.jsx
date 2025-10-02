import React from 'react';
import { cn } from '../../utils/cn';

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  success: 'bg-green-100 text-green-800 hover:bg-green-200',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  error: 'bg-red-100 text-red-800 hover:bg-red-200',
  danger: 'bg-red-100 text-red-800 hover:bg-red-200',
  outline: 'text-gray-900 border border-gray-200 hover:bg-gray-50',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  info: 'bg-sky-100 text-sky-800 hover:bg-sky-200',
  destructive: 'bg-red-100 text-red-800 hover:bg-red-200',
};

const badgeSizes = {
  xs: 'px-2 py-0.5 text-xs min-h-[18px]',
  sm: 'px-2.5 py-1 text-xs min-h-[20px]',
  default: 'px-2.5 py-0.5 text-xs min-h-[22px]',
  lg: 'px-4 py-2 text-sm min-h-[28px]',
};

const Badge = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export default Badge;