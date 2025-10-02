import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Badge } from './Badge';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiMinus,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

const StatsCard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  color = 'blue',
  format = 'number',
  loading = false,
  onClick,
  className = ""
}) => {
  // Calculate trend if not provided
  const calculatedTrend = trend || (previousValue !== undefined ? 
    (value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral') : 
    'neutral'
  );

  // Calculate trend percentage if not provided
  const calculatedTrendValue = trendValue || (previousValue !== undefined && previousValue !== 0 ? 
    Math.abs(((value - previousValue) / previousValue) * 100).toFixed(1) : 
    0
  );

  // Format value based on type
  const formatValue = (val) => {
    if (loading) return '---';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val || 0);
      
      case 'percentage':
        return `${(val || 0).toFixed(1)}%`;
      
      case 'decimal':
        return (val || 0).toFixed(2);
      
      case 'compact':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(val || 0);
      
      default:
        return new Intl.NumberFormat('en-US').format(val || 0);
    }
  };

  // Get trend colors and icons
  const getTrendConfig = () => {
    switch (calculatedTrend) {
      case 'up':
        return {
          icon: FiTrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          arrowIcon: FiArrowUp
        };
      case 'down':
        return {
          icon: FiTrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          arrowIcon: FiArrowDown
        };
      default:
        return {
          icon: FiMinus,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          arrowIcon: FiMinus
        };
    }
  };

  const trendConfig = getTrendConfig();

  // Get color classes based on color prop
  const getColorClasses = () => {
    const colors = {
      blue: {
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        accent: 'border-blue-200'
      },
      green: {
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
        accent: 'border-green-200'
      },
      red: {
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
        accent: 'border-red-200'
      },
      yellow: {
        icon: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        accent: 'border-yellow-200'
      },
      purple: {
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        accent: 'border-purple-200'
      },
      indigo: {
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        accent: 'border-indigo-200'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`p-6 border-l-4 ${colorClasses.accent} ${
          onClick ? 'cursor-pointer hover:shadow-md' : ''
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Title */}
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>

            {/* Value */}
            <div className="flex items-baseline space-x-2">
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <motion.p 
                  className="text-2xl font-bold text-gray-900"
                  key={value} // Re-animate when value changes
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatValue(value)}
                </motion.p>
              )}

              {/* Trend indicator */}
              {(calculatedTrendValue > 0 || trendLabel) && !loading && (
                <div className={`flex items-center space-x-1 ${trendConfig.color}`}>
                  <trendConfig.arrowIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {trendLabel || `${calculatedTrendValue}%`}
                  </span>
                </div>
              )}
            </div>

            {/* Additional trend info */}
            {previousValue !== undefined && !loading && (
              <p className="text-xs text-gray-500 mt-1">
                vs. {formatValue(previousValue)} previous period
              </p>
            )}
          </div>

          {/* Icon */}
          {Icon && (
            <div className={`p-3 rounded-full ${colorClasses.iconBg}`}>
              <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
            </div>
          )}
        </div>

        {/* Loading skeleton for trend */}
        {loading && (
          <div className="mt-2">
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// Preset configurations for common stats
export const StatsCardPresets = {
  revenue: {
    title: "Total Revenue",
    color: "green",
    format: "currency"
  },
  patients: {
    title: "Total Patients",
    color: "blue",
    format: "number"
  },
  tests: {
    title: "Tests Completed",
    color: "purple",
    format: "number"
  },
  pending: {
    title: "Pending Reports",
    color: "yellow",
    format: "number"
  },
  growth: {
    title: "Growth Rate",
    color: "green",
    format: "percentage"
  },
  conversion: {
    title: "Conversion Rate",
    color: "indigo",
    format: "percentage"
  }
};

export default StatsCard;