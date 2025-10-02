import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiChevronDown, 
  FiX, 
  FiCheck,
  FiLoader
} from 'react-icons/fi';

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  onSearch,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  multiple = false,
  clearable = true,
  disabled = false,
  loading = false,
  error = false,
  emptyMessage = "No options found",
  loadingMessage = "Loading...",
  maxHeight = "200px",
  className = "",
  renderOption,
  renderValue,
  getOptionLabel = (option) => option.label || option.name || option,
  getOptionValue = (option) => option.value || option.id || option,
  async = false,
  debounceMs = 300
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  useEffect(() => {
    if (async && onSearch) {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce async search
      debounceRef.current = setTimeout(() => {
        onSearch(searchQuery);
      }, debounceMs);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    } else {
      // Local filtering
      const filtered = options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options, async, onSearch, debounceMs]);

  // Update filtered options when options change (for async)
  useEffect(() => {
    if (async) {
      setFilteredOptions(options);
    }
  }, [options, async]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current) {
      const optionElement = optionsRef.current.children[highlightedIndex];
      if (optionElement) {
        optionElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const handleOptionSelect = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const optionValue = getOptionValue(option);
      const isSelected = currentValues.some(v => getOptionValue(v) === optionValue);
      
      if (isSelected) {
        // Remove from selection
        const newValue = currentValues.filter(v => getOptionValue(v) !== optionValue);
        onChange(newValue);
      } else {
        // Add to selection
        onChange([...currentValues, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  const handleRemoveItem = (itemToRemove, e) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter(v => getOptionValue(v) !== getOptionValue(itemToRemove));
      onChange(newValue);
    }
  };

  const isSelected = (option) => {
    if (multiple && Array.isArray(value)) {
      return value.some(v => getOptionValue(v) === getOptionValue(option));
    }
    return value && getOptionValue(value) === getOptionValue(option);
  };

  const renderSelectedValue = () => {
    if (multiple && Array.isArray(value) && value.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <span
              key={getOptionValue(item)}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {renderValue ? renderValue(item) : getOptionLabel(item)}
              <button
                type="button"
                onClick={(e) => handleRemoveItem(item, e)}
                className="ml-1 hover:text-blue-600"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      );
    }

    if (value && !multiple) {
      return renderValue ? renderValue(value) : getOptionLabel(value);
    }

    return <span className="text-gray-500">{placeholder}</span>;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main input/trigger */}
      <div
        className={`
          w-full px-3 py-2 border rounded-md cursor-pointer
          flex items-center justify-between
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex-1 min-w-0">
          {renderSelectedValue()}
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
          >
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Options list */}
            <div
              ref={optionsRef}
              className="overflow-y-auto"
              style={{ maxHeight }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <FiLoader className="w-4 h-4 animate-spin mr-2" />
                  {loadingMessage}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <motion.div
                    key={getOptionValue(option)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`
                      px-3 py-2 cursor-pointer flex items-center justify-between
                      ${highlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${isSelected(option) ? 'bg-blue-100 text-blue-800' : 'text-gray-900'}
                    `}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className="flex-1">
                      {renderOption ? renderOption(option) : getOptionLabel(option)}
                    </div>
                    
                    {isSelected(option) && (
                      <FiCheck className="w-4 h-4 text-blue-600" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;