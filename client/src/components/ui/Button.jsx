import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  variant: {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500',
  },
  size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  },
};

const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  children,
  ...props
}, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };