import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { Card } from "./Card";
import { Badge } from "./Badge";
import {
  FiX,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiChevronDown,
} from "react-icons/fi";

const ContextualInput = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Input Required",
  description,
  type = "text",
  value = "",
  placeholder = "Enter value...",
  options = [],
  validation = null,
  required = false,
  multiline = false,
  predefinedValues = [],
  allowCustom = true,
  position = "center",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState("");
  const [showPredefined, setShowPredefined] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Validate input
  useEffect(() => {
    if (validation && inputValue) {
      try {
        const result = validation(inputValue);
        if (typeof result === "string") {
          setValidationError(result);
          setIsValid(false);
        } else {
          setValidationError("");
          setIsValid(result);
        }
      } catch (error) {
        setValidationError(error.message);
        setIsValid(false);
      }
    } else {
      setValidationError("");
      setIsValid(true);
    }
  }, [inputValue, validation]);

  const handleSubmit = () => {
    if (required && !inputValue.trim()) {
      setValidationError("This field is required");
      setIsValid(false);
      return;
    }

    if (!isValid) {
      return;
    }

    onSubmit(inputValue);
    setInputValue("");
    setValidationError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handlePredefinedSelect = (predefinedValue) => {
    setInputValue(predefinedValue);
    setShowPredefined(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "left":
        return "left-4 top-1/2 transform -translate-y-1/2";
      case "right":
        return "right-4 top-1/2 transform -translate-y-1/2";
      default:
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }
  };

  const renderInput = () => {
    const commonProps = {
      ref: inputRef,
      value: inputValue,
      onChange: (e) => setInputValue(e.target.value),
      onKeyDown: handleKeyPress,
      placeholder,
      className: `${validationError ? "border-red-300 focus:border-red-500" : ""}`,
    };

    switch (type) {
      case "select":
        return (
          <Select {...commonProps}>
            <option value="">Select an option...</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </Select>
        );

      case "textarea":
      case "multiline":
        return (
          <Textarea
            {...commonProps}
            rows={multiline ? 4 : 3}
            className={`resize-none ${commonProps.className}`}
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            step="any"
          />
        );

      case "email":
        return (
          <Input
            {...commonProps}
            type="email"
          />
        );

      case "password":
        return (
          <Input
            {...commonProps}
            type="password"
          />
        );

      case "date":
        return (
          <Input
            {...commonProps}
            type="date"
          />
        );

      case "time":
        return (
          <Input
            {...commonProps}
            type="time"
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`w-full max-w-md ${className}`}
          >
            <Card className="p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>

              {/* Predefined Values */}
              {predefinedValues.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Quick Options
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPredefined(!showPredefined)}
                      className="p-1"
                    >
                      <FiChevronDown
                        className={`w-4 h-4 transition-transform ${
                          showPredefined ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                  <AnimatePresence>
                    {showPredefined && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 mb-3"
                      >
                        {predefinedValues.map((predefined, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                            onClick={() => handlePredefinedSelect(predefined)}
                          >
                            {predefined}
                          </Badge>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Input Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {allowCustom && predefinedValues.length > 0
                    ? "Or enter custom value"
                    : "Value"}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderInput()}
                
                {/* Validation Error */}
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2 text-red-600"
                  >
                    <FiAlertCircle className="w-4 h-4" />
                    <span className="text-sm">{validationError}</span>
                  </motion.div>
                )}

                {/* Help Text */}
                {!validationError && type === "email" && (
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <FiInfo className="w-4 h-4" />
                    <span className="text-sm">Enter a valid email address</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || (required && !inputValue.trim())}
                  className="flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  Submit
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualInput;