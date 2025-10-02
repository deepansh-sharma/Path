import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Checkbox } from "../../../components/ui/Checkbox";
import {
  FiGrid,
  FiList,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPackage,
  FiBarcode,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiMoreHorizontal,
  FiPlus,
  FiMinus,
} from "react-icons/fi";

const ItemsTable = ({
  items,
  selectedItems,
  onSelectionChange,
  viewMode,
  onViewModeChange,
  onBulkAction,
  contextualInputs,
  onContextualInput,
  onCloseContextualInput,
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Handle item selection
  const handleItemSelect = (itemId) => {
    const isSelected = selectedItems.includes(itemId);
    if (isSelected) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  // Get stock status configuration
  const getStockStatus = (item) => {
    if (item.currentStock === 0) {
      return { variant: "danger", text: "Out of Stock", icon: FiTrendingDown };
    } else if (item.currentStock <= item.minStock) {
      return { variant: "warning", text: "Low Stock", icon: FiAlertTriangle };
    } else {
      return { variant: "success", text: "In Stock", icon: FiTrendingUp };
    }
  };

  // Handle contextual actions
  const handleContextualAction = (action, itemId, currentValue = "") => {
    const key = `${action}_${itemId}`;
    onContextualInput(key, currentValue, getInputType(action));
  };

  const getInputType = (action) => {
    const typeMap = {
      updateStock: "number",
      updatePrice: "number",
      updateLocation: "text",
      addNote: "textarea",
      setExpiry: "date",
    };
    return typeMap[action] || "text";
  };

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => {
        const status = getStockStatus(item);
        const StatusIcon = status.icon;
        const isSelected = selectedItems.includes(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Card className={`p-4 hover:shadow-lg transition-all duration-200 ${
              isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleItemSelect(item.id)}
                  />
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <Badge variant={status.variant} size="sm" className="flex items-center gap-1">
                  <StatusIcon className="w-3 h-3" />
                  {status.text}
                </Badge>
              </div>

              {/* Item Info */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">ID: {item.id}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiBarcode className="w-4 h-4" />
                  <span>{item.barcode}</span>
                </div>
              </div>

              {/* Stock Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-medium">{item.currentStock} {item.unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min Stock:</span>
                  <span>{item.minStock} {item.unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">${item.unitPrice}</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-1 mb-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiMapPin className="w-3 h-3" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  <span>Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}</span>
                </div>
                {item.expiryDate && (
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <AnimatePresence>
                {(hoveredItem === item.id || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContextualAction("updateStock", item.id, item.currentStock)}
                      className="flex-1 text-xs"
                    >
                      <FiPlus className="w-3 h-3 mr-1" />
                      Stock
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContextualAction("updatePrice", item.id, item.unitPrice)}
                      className="flex-1 text-xs"
                    >
                      <FiDollarSign className="w-3 h-3 mr-1" />
                      Price
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2"
                    >
                      <FiMoreHorizontal className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  // Render table view
  const renderTableView = () => (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedItems.length === items.length && items.length > 0}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Item</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => {
              const status = getStockStatus(item);
              const StatusIcon = status.icon;
              const isSelected = selectedItems.includes(item.id);

              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleItemSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" size="sm">{item.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium">{item.currentStock} {item.unit}</p>
                      <p className="text-gray-500">Min: {item.minStock}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant} size="sm" className="flex items-center gap-1 w-fit">
                      <StatusIcon className="w-3 h-3" />
                      {status.text}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">${item.unitPrice}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FiMapPin className="w-3 h-3" />
                      {item.location}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleContextualAction("updateStock", item.id, item.currentStock)}
                        className="p-1"
                      >
                        <FiPlus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleContextualAction("updatePrice", item.id, item.unitPrice)}
                        className="p-1"
                      >
                        <FiDollarSign className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1"
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory Items</h2>
          <p className="text-sm text-gray-600 mt-1">
            {items.length} items • {selectedItems.length} selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction("updateStock")}
              >
                Update Stock
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction("delete")}
              >
                Delete Selected
              </Button>
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => onViewModeChange("grid")}
              className="px-3"
            >
              <FiGrid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => onViewModeChange("table")}
              className="px-3"
            >
              <FiList className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {viewMode === "grid" ? renderGridView() : renderTableView()}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first inventory item.</p>
          <Button>
            <FiPlus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemsTable;