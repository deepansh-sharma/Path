import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

const RevenueChart = ({ data, height = 300 }) => {
  const { isDarkMode } = useTheme();
  
  // Theme colors
  const colors = {
    text: isDarkMode ? "#94a3b8" : "#64748b",
    grid: isDarkMode ? "#334155" : "#e2e8f0",
    tooltip: isDarkMode ? "#1e293b" : "#ffffff",
    revenue: "#3b82f6",
  };

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString()}`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis 
          dataKey="month" 
          tick={{ fill: colors.text }}
          axisLine={{ stroke: colors.grid }}
          tickLine={{ stroke: colors.grid }}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          tick={{ fill: colors.text }}
          axisLine={{ stroke: colors.grid }}
          tickLine={{ stroke: colors.grid }}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value), "Revenue"]}
          contentStyle={{ 
            backgroundColor: colors.tooltip,
            borderColor: colors.grid,
            borderRadius: "0.375rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          labelStyle={{ color: isDarkMode ? "#e2e8f0" : "#1e293b" }}
        />
        <Legend wrapperStyle={{ color: colors.text }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={colors.revenue}
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;