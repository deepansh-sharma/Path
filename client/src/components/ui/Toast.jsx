import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { cn } from '../../utils/cn';

// Toast Context
const ToastContext = createContext();

// Toast Reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, { ...action.payload, id: Date.now() }];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload);
    case 'CLEAR_TOASTS':
      return [];
    default:
      return state;
  }
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((toast) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
    
    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: toast.id || Date.now() });
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const clearToasts = useCallback(() => {
    dispatch({ type: 'CLEAR_TOASTS' });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Component
const Toast = ({ 
  id,
  title, 
  description, 
  type = 'default', 
  duration = 5000,
  onClose,
  className,
  ...props 
}) => {
  const typeStyles = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div
      className={cn(
        'relative flex w-full items-center space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        typeStyles[type],
        className
      )}
      {...props}
    >
      {iconStyles[type] && (
        <div className="flex-shrink-0">
          <span className="text-lg">{iconStyles[type]}</span>
        </div>
      )}
      
      <div className="flex-1 space-y-1">
        {title && (
          <div className="text-sm font-semibold">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>

      <button
        onClick={() => onClose?.(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        <span className="sr-only">Close</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Toast Container
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
          className="mb-2 last:mb-0"
        />
      ))}
    </div>
  );
};

// Helper functions for easier toast usage
export const showToast = (message, type = 'default', options = {}) => {
  // This function will be used with the useToast hook
  return { title: message, type, ...options };
};

export const toast = {
  success: (message, options = {}) => showToast(message, 'success', options),
  error: (message, options = {}) => showToast(message, 'error', options),
  warning: (message, options = {}) => showToast(message, 'warning', options),
  info: (message, options = {}) => showToast(message, 'info', options),
  default: (message, options = {}) => showToast(message, 'default', options),
};

export { Toast, ToastContainer };
export default Toast;