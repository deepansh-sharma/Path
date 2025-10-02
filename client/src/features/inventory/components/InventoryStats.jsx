import React from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiDollarSign,
  FiShoppingCart,
  FiTruck,
  FiCalendar,
} from "react-icons/fi";

const InventoryStats = ({ data }) => {
  // Calculate statistics from data
  const calculateStats = () => {
    const { items, suppliers } = data;
    
    const totalItems = items.length;
    const inStockItems = items.filter(item => item.status === "in_stock").length;
    const lowStockItems = items.filter(item => item.status === "low_stock").length;
    const outOfStockItems = items.filter(item => item.status === "out_of_stock").length;
    
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
    const lowStockValue = items
      .filter(item => item.status === "low_stock")
      .reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
    
    const activeSuppliers = suppliers.filter(supplier => supplier.status === "active").length;
    
    // Calculate items expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoonItems = items.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;

    return {
      totalItems,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      lowStockValue,
      activeSuppliers,
      expiringSoonItems,
      stockPercentage: totalItems > 0 ? Math.round((inStockItems / totalItems) * 100) : 0,
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      id: "total-items",
      title: "Total Items",
      value: stats.totalItems,
      icon: FiPackage,
      color: "blue",
      trend: null,
      description: "Items in inventory",
    },
    {
      id: "in-stock",
      title: "In Stock",
      value: stats.inStockItems,
      icon: FiTrendingUp,
      color: "green",
      trend: { value: stats.stockPercentage, label: "Stock Level" },
      description: "Items available",
    },
    {
      id: "low-stock",
      title: "Low Stock",
      value: stats.lowStockItems,
      icon: FiAlertTriangle,
      color: "yellow",
      trend: stats.lowStockItems > 0 ? { value: stats.lowStockItems, label: "Need Reorder" } : null,
      description: "Items running low",
    },
    {
      id: "out-of-stock",
      title: "Out of Stock",
      value: stats.outOfStockItems,
      icon: FiTrendingDown,
      color: "red",
      trend: stats.outOfStockItems > 0 ? { value: stats.outOfStockItems, label: "Urgent" } : null,
      description: "Items unavailable",
    },
    {
      id: "total-value",
      title: "Total Value",
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: FiDollarSign,
      color: "purple",
      trend: null,
      description: "Inventory worth",
    },
    {
      id: "active-suppliers",
      title: "Active Suppliers",
      value: stats.activeSuppliers,
      icon: FiTruck,
      color: "indigo",
      trend: null,
      description: "Supplier partners",
    },
    {
      id: "expiring-soon",
      title: "Expiring Soon",
      value: stats.expiringSoonItems,
      icon: FiCalendar,
      color: "orange",
      trend: stats.expiringSoonItems > 0 ? { value: "30 days", label: "Time frame" } : null,
      description: "Items expiring",
    },
    {
      id: "low-stock-value",
      title: "Low Stock Value",
      value: `$${stats.lowStockValue.toLocaleString()}`,
      icon: FiShoppingCart,
      color: "pink",
      trend: null,
      description: "Value at risk",
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        icon: "bg-blue-100 text-blue-600",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        icon: "bg-green-100 text-green-600",
        text: "text-green-600",
        border: "border-green-200",
      },
      yellow: {
        bg: "bg-yellow-50",
        icon: "bg-yellow-100 text-yellow-600",
        text: "text-yellow-600",
        border: "border-yellow-200",
      },
      red: {
        bg: "bg-red-50",
        icon: "bg-red-100 text-red-600",
        text: "text-red-600",
        border: "border-red-200",
      },
      purple: {
        bg: "bg-purple-50",
        icon: "bg-purple-100 text-purple-600",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      indigo: {
        bg: "bg-indigo-50",
        icon: "bg-indigo-100 text-indigo-600",
        text: "text-indigo-600",
        border: "border-indigo-200",
      },
      orange: {
        bg: "bg-orange-50",
        icon: "bg-orange-100 text-orange-600",
        text: "text-orange-600",
        border: "border-orange-200",
      },
      pink: {
        bg: "bg-pink-50",
        icon: "bg-pink-100 text-pink-600",
        text: "text-pink-600",
        border: "border-pink-200",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`p-6 ${colors.bg} border ${colors.border} hover:shadow-lg transition-shadow duration-200`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${colors.text}`}>
                        {stat.value}
                      </p>
                      {stat.trend && (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" size="xs" className={`${colors.text} border-current`}>
                            {stat.trend.value}
                          </Badge>
                          <span className="text-xs text-gray-500">{stat.trend.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default InventoryStats;