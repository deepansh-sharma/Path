import React, { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

const RangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value = [min, max],
  onValueChange,
  className,
  disabled = false,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback((newValue) => {
    setLocalValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);

  const handleMinChange = (event) => {
    const newMin = Math.min(Number(event.target.value), localValue[1]);
    handleChange([newMin, localValue[1]]);
  };

  const handleMaxChange = (event) => {
    const newMax = Math.max(Number(event.target.value), localValue[0]);
    handleChange([localValue[0], newMax]);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full", className)} {...props}>
      <div className="relative h-2">
        {/* Track */}
        <div className="absolute inset-0 rounded-full bg-gray-200" />
        
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-blue-500"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          disabled={disabled}
          className={cn(
            "absolute inset-0 h-2 w-full appearance-none bg-transparent",
            "cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
            "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white",
            "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
        
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          disabled={disabled}
          className={cn(
            "absolute inset-0 h-2 w-full appearance-none bg-transparent",
            "cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
            "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white",
            "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
      </div>
      
      {/* Value display */}
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <span>{localValue[0]}</span>
        <span>{localValue[1]}</span>
      </div>
    </div>
  );
};

export { RangeSlider };
export default RangeSlider;