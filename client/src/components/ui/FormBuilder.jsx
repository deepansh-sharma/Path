import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { Card } from './Card';
import { Badge } from './Badge';
import { 
  FiSave, 
  FiX, 
  FiPlus, 
  FiMinus,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';

const FormBuilder = ({
  schema = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Save",
  cancelText = "Cancel",
  showCancel = true,
  className = ""
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Validate individual field
  const validateField = (field, value) => {
    const errors = [];

    if (field.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field.label} is required`);
    }

    if (field.validation) {
      if (field.validation.minLength && value && value.length < field.validation.minLength) {
        errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
      }

      if (field.validation.maxLength && value && value.length > field.validation.maxLength) {
        errors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
      }

      if (field.validation.min && value && parseFloat(value) < field.validation.min) {
        errors.push(`${field.label} must be at least ${field.validation.min}`);
      }

      if (field.validation.max && value && parseFloat(value) > field.validation.max) {
        errors.push(`${field.label} must be no more than ${field.validation.max}`);
      }

      if (field.validation.pattern && value && !field.validation.pattern.test(value)) {
        errors.push(field.validation.message || `${field.label} format is invalid`);
      }

      if (field.validation.custom && typeof field.validation.custom === 'function') {
        const customError = field.validation.custom(value, formData);
        if (customError) errors.push(customError);
      }
    }

    return errors;
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    schema.forEach(field => {
      if (shouldShowField(field)) {
        const fieldErrors = validateField(field, formData[field.name]);
        if (fieldErrors.length > 0) {
          newErrors[field.name] = fieldErrors;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Check if field should be shown based on conditions
  const shouldShowField = (field) => {
    if (!field.condition) return true;

    const { dependsOn, value, operator = 'equals' } = field.condition;
    const dependentValue = formData[dependsOn];

    switch (operator) {
      case 'equals':
        return dependentValue === value;
      case 'not_equals':
        return dependentValue !== value;
      case 'contains':
        return Array.isArray(dependentValue) && dependentValue.includes(value);
      case 'greater_than':
        return parseFloat(dependentValue) > parseFloat(value);
      case 'less_than':
        return parseFloat(dependentValue) < parseFloat(value);
      default:
        return true;
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Clear errors for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleArrayFieldAdd = (fieldName) => {
    const currentArray = formData[fieldName] || [];
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...currentArray, '']
    }));
  };

  const handleArrayFieldRemove = (fieldName, index) => {
    const currentArray = formData[fieldName] || [];
    setFormData(prev => ({
      ...prev,
      [fieldName]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const handleArrayFieldChange = (fieldName, index, value) => {
    const currentArray = formData[fieldName] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [fieldName]: newArray }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    schema.forEach(field => {
      if (shouldShowField(field)) {
        allTouched[field.name] = true;
      }
    });
    setTouched(allTouched);

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const fieldErrors = errors[field.name] || [];
    const hasError = fieldErrors.length > 0;

    const commonProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      disabled: field.disabled || loading,
      required: field.required
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={hasError}
          />
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            rows={field.rows || 3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            value={value}
            onChange={(value) => handleFieldChange(field.name, value)}
            options={field.options || []}
            error={hasError}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            {...commonProps}
            checked={!!value}
            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            label={field.checkboxLabel}
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={field.disabled || loading}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'array':
        const arrayValue = formData[field.name] || [];
        return (
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item}
                  onChange={(e) => handleArrayFieldChange(field.name, index, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={field.disabled || loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayFieldRemove(field.name, index)}
                  disabled={field.disabled || loading}
                >
                  <FiMinus className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleArrayFieldAdd(field.name)}
              disabled={field.disabled || loading}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add {field.label}
            </Button>
          </div>
        );

      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            onChange={(e) => {
              const files = field.multiple ? Array.from(e.target.files) : e.target.files[0];
              handleFieldChange(field.name, files);
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={hasError}
          />
        );
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {schema.map((field) => {
            if (!shouldShowField(field)) return null;

            const fieldErrors = errors[field.name] || [];
            const hasError = fieldErrors.length > 0;

            return (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.tooltip && (
                    <div className="group relative">
                      <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {field.tooltip}
                      </div>
                    </div>
                  )}
                </div>

                {renderField(field)}

                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}

                {hasError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-1 text-red-600 text-sm"
                  >
                    <FiAlertCircle className="w-4 h-4" />
                    <span>{fieldErrors[0]}</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <FiX className="w-4 h-4 mr-2" />
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            <FiSave className="w-4 h-4 mr-2" />
            {submitText}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FormBuilder;