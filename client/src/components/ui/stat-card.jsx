import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./Card";
import { cn } from "../../../src/utils/cn";
import { useTheme } from "../../contexts/ThemeContext";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
  subtitle,
  className,
}) => {
  const { isDarkMode } = useTheme();

  const colorStyles = {
    blue: {
      bg: isDarkMode ? "bg-blue-900/20" : "bg-blue-100",
      text: "text-blue-600",
      icon: "text-blue-500",
    },
    green: {
      bg: isDarkMode ? "bg-green-900/20" : "bg-green-100",
      text: "text-green-600",
      icon: "text-green-500",
    },
    red: {
      bg: isDarkMode ? "bg-red-900/20" : "bg-red-100",
      text: "text-red-600",
      icon: "text-red-500",
    },
    purple: {
      bg: isDarkMode ? "bg-purple-900/20" : "bg-purple-100",
      text: "text-purple-600",
      icon: "text-purple-500",
    },
    orange: {
      bg: isDarkMode ? "bg-orange-900/20" : "bg-orange-100",
      text: "text-orange-600",
      icon: "text-orange-500",
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("", className)}
    >
      <Card
        className={cn(
          "overflow-hidden",
          isDarkMode ? "border-slate-800" : "border-slate-200"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                )}
              >
                {title}
              </p>
              <h3
                className={cn(
                  "text-2xl font-bold mt-1",
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                )}
              >
                {value}
              </h3>
              {subtitle && (
                <p
                  className={cn(
                    "text-xs mt-1",
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {subtitle}
                </p>
              )}
              {trend !== undefined && (
                <div className="flex items-center mt-2">
                  <span
                    className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      trend > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {trend > 0 ? "+" : ""}
                    {trend}%
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">
                    vs last month
                  </span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-full", styles.bg)}>
              {Icon && <Icon className={cn("w-6 h-6", styles.icon)} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
