import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { ContextualInput } from "../../../components/ui/ContextualInput";
import {
  FiAlertTriangle,
  FiAlertCircle,
  FiClock,
  FiPackage,
  FiTrendingDown,
  FiRefreshCw,
  FiSettings,
  FiFilter,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";

const StockAlerts = ({ alerts = [], onResolve, onSnooze, onUpdateThreshold }) => {
  const [contextualInput, setContextualInput] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const handleContextualAction = (action, alert, field) => {
    setContextualInput({
      action,
      alert,
      field,
      position: { x: 0, y: 0 },
    });
  };

  const handleContextualSubmit = (value) => {
    if (contextualInput && onUpdateThreshold) {
      onUpdateThreshold(contextualInput.alert.itemId, {
        [contextualInput.field]: parseInt(value)
      });
    }
    setContextualInput(null);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "low_stock":
        return <FiAlertTriangle className="w-5 h-5" />;
      case "out_of_stock":
        return <FiAlertCircle className="w-5 h-5" />;
      case "expiring_soon":
        return <FiClock className="w-5 h-5" />;
      case "expired":
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiPackage className="w-5 h-5" />;
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getBadgeVariant = (priority) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatAlertMessage = (alert) => {
    switch (alert.type) {
      case "low_stock":
        return `Stock is running low (${alert.currentStock} remaining)`;
      case "out_of_stock":
        return "Item is out of stock";
      case "expiring_soon":
        return `Expires in ${alert.daysUntilExpiry} days`;
      case "expired":
        return `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`;
      default:
        return alert.message;
    }
  };

  const alertTypes = [
    { value: "all", label: "All Types" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "expiring_soon", label: "Expiring Soon" },
    { value: "expired", label: "Expired" },
  ];

  const priorityLevels = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiAlertTriangle className="text-orange-600" />
            Stock Alerts
            {filteredAlerts.length > 0 && (
              <Badge variant="warning" size="sm">
                {filteredAlerts.length}
              </Badge>
            )}
          </h2>
          <p className="text-sm text-gray-600">
            Monitor and manage inventory alerts
          </p>
        </div>
        <Button variant="outline" size="sm">
          <FiSettings className="w-4 h-4 mr-2" />
          Alert Settings
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search alerts by item name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={FiSearch}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {alertTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priorityLevels.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-4 border-l-4 ${getAlertColor(alert.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getAlertColor(alert.priority)}`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {alert.itemName}
                      </h3>
                      <Badge variant="outline" size="sm">
                        {alert.itemCode}
                      </Badge>
                      <Badge variant={getBadgeVariant(alert.priority)} size="sm">
                        {alert.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {formatAlertMessage(alert)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiPackage className="w-3 h-3" />
                        <span>Current: {alert.currentStock}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiTrendingDown className="w-3 h-3" />
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            setContextualInput({
                              action: "update_threshold",
                              alert,
                              field: "threshold",
                              position: { x: rect.left, y: rect.bottom + 5 },
                            });
                          }}
                        >
                          Threshold: {alert.threshold}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>{alert.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {alert.type !== "expired" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSnooze?.(alert.id)}
                    >
                      <FiClock className="w-4 h-4 mr-1" />
                      Snooze
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResolve?.(alert.id)}
                    className="text-green-600 hover:text-green-700 hover:border-green-300"
                  >
                    <FiRefreshCw className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <FiAlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {alerts.length === 0 ? "No alerts" : "No matching alerts"}
          </h3>
          <p className="text-gray-600">
            {alerts.length === 0 
              ? "All your inventory levels are healthy!"
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </div>
      )}

      {/* Contextual Input */}
      {contextualInput && (
        <ContextualInput
          isOpen={true}
          onClose={() => setContextualInput(null)}
          onSubmit={handleContextualSubmit}
          title="Update Threshold"
          placeholder="Enter new threshold value"
          defaultValue={contextualInput.alert.threshold?.toString()}
          position={contextualInput.position}
          type="number"
        />
      )}
    </div>
  );
};

export default StockAlerts;