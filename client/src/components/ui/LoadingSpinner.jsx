import React from 'react';
import { cn } from '../../utils/utils';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className,
  text,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    'text-blue-600': color === 'primary',
    'text-green-600': color === 'success',
    'text-yellow-600': color === 'warning',
    'text-red-600': color === 'error',
    'text-gray-600': color === 'neutral',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)} {...props}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200',
          sizeClasses[size],
          colorClasses,
          'border-t-current'
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium mt-2">{text}</p>
      )}
    </div>
  );
};

const InlineSpinner = ({ size = 'sm', color = 'primary', text, className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    'text-blue-600': color === 'primary',
    'text-green-600': color === 'success',
    'text-yellow-600': color === 'warning',
    'text-red-600': color === 'error',
    'text-gray-600': color === 'neutral',
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200',
          sizeClasses[size],
          colorClasses,
          'border-t-current'
        )}
      />
      {text && (
        <span className="text-sm text-gray-600 font-medium">{text}</span>
      )}
    </div>
  );
};

const LoadingSkeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse bg-gray-200 rounded', className)}
      {...props}
    />
  );
};

export { LoadingSpinner, InlineSpinner, LoadingSkeleton };
export default LoadingSpinner;