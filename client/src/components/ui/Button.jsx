import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const Button = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800",
      warning:
        "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 active:bg-yellow-800",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
      outline:
        "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100",
      ghost:
        "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200",
      link: "text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500 p-0",
    };

    const sizeClasses = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg",
    };

    const fullWidthClass = fullWidth ? "w-full" : "";

    const combinedClasses = [
      baseClasses,
      variantClasses[variant],
      variant !== "link" ? sizeClasses[size] : "",
      fullWidthClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick = (e) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <motion.button
        ref={ref}
        type={type}
        className={combinedClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        <span className={loading ? "opacity-0" : ""}>{children}</span>
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

// Button Group Component
const ButtonGroup = ({
  children,
  className = "",
  orientation = "horizontal",
  ...props
}) => {
  const orientationClasses = {
    horizontal: "flex flex-row",
    vertical: "flex flex-col",
  };

  const groupClasses = [
    orientationClasses[orientation],
    "rounded-lg overflow-hidden border border-gray-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={groupClasses} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: `${child.props.className || ""} ${
              orientation === "horizontal"
                ? "rounded-none border-r border-gray-200 last:border-r-0"
                : "rounded-none border-b border-gray-200 last:border-b-0"
            }`.trim(),
          });
        }
        return child;
      })}
    </div>
  );
};

// Icon Button Component
const IconButton = React.forwardRef(
  ({ icon, className = "", size = "md", variant = "ghost", ...props }, ref) => {
    const iconSizeClasses = {
      xs: "p-1",
      sm: "p-1.5",
      md: "p-2",
      lg: "p-3",
      xl: "p-4",
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        className={`${iconSizeClasses[size]} ${className}`}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "warning",
    "danger",
    "outline",
    "ghost",
    "link",
  ]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

ButtonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
};

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "warning",
    "danger",
    "outline",
    "ghost",
    "link",
  ]),
};

export { Button, ButtonGroup, IconButton };
