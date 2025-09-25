import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

const PatientGrowthChart = ({ data, height = 300 }) => {
  const { isDarkMode } = useTheme();
  
  // Theme colors
  const colors = {
    text: isDarkMode ? "#94a3b8" : "#64748b",
    grid: isDarkMode ? "#334155" : "#e2e8f0",
    tooltip: isDarkMode ? "#1e293b" : "#ffffff",
    area: "#10b981",
    areaFill: isDarkMode ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.1)",
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
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
          tick={{ fill: colors.text }}
          axisLine={{ stroke: colors.grid }}
          tickLine={{ stroke: colors.grid }}
        />
        <Tooltip 
          formatter={(value) => [`${value} patients`, "New Patients"]}
          contentStyle={{ 
            backgroundColor: colors.tooltip,
            borderColor: colors.grid,
            borderRadius: "0.375rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          labelStyle={{ color: isDarkMode ? "#e2e8f0" : "#1e293b" }}
        />
        <Legend wrapperStyle={{ color: colors.text }} />
        <Area
          type="monotone"
          dataKey="patients"
          name="New Patients"
          stroke={colors.area}
          fill={colors.areaFill}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PatientGrowthChart;