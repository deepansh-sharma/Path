import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { ContextualInput } from "../../../components/ui/ContextualInput";
import {
  FiPlus,
  FiEdit3,
  FiEye,
  FiDownload,
  FiSend,
  FiCheck,
  FiX,
  FiClock,
  FiTruck,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiPackage,
  FiSearch,
  FiFilter,
} from "react-icons/fi";

const PurchaseOrders = ({ orders = [], onAdd, onEdit, onView, onApprove, onReject, onSend }) => {
  const [contextualInput, setContextualInput] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleContextualAction = (action, order, field) => {
    setContextualInput({
      action,
      order,
      field,
      position: { x: 0, y: 0 },
    });
  };

  const handleContextualSubmit = (value) => {
    if (contextualInput && onEdit) {
      onEdit(contextualInput.order.id, {
        [contextualInput.field]: value
      });
    }
    setContextualInput(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "pending":
        return "warning";
      case "approved":
        return "info";
      case "sent":
        return "primary";
      case "received":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <FiEdit3 className="w-4 h-4" />;
      case "pending":
        return <FiClock className="w-4 h-4" />;
      case "approved":
        return <FiCheck className="w-4 h-4" />;
      case "sent":
        return <FiSend className="w-4 h-4" />;
      case "received":
        return <FiTruck className="w-4 h-4" />;
      case "cancelled":
        return <FiX className="w-4 h-4" />;
      default:
        return <FiPackage className="w-4 h-4" />;
    }
  };

  const getActionButtons = (order) => {
    const buttons = [];

    switch (order.status) {
      case "draft":
        buttons.push(
          <Button
            key="edit"
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(order)}
          >
            <FiEdit3 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        );
        buttons.push(
          <Button
            key="send"
            size="sm"
            onClick={() => onSend?.(order)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FiSend className="w-4 h-4 mr-1" />
            Send
          </Button>
        );
        break;
      
      case "pending":
        buttons.push(
          <Button
            key="approve"
            size="sm"
            onClick={() => onApprove?.(order)}
            className="bg-green-600 hover:bg-green-700"
          >
            <FiCheck className="w-4 h-4 mr-1" />
            Approve
          </Button>
        );
        buttons.push(
          <Button
            key="reject"
            variant="outline"
            size="sm"
            onClick={() => onReject?.(order)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <FiX className="w-4 h-4 mr-1" />
            Reject
          </Button>
        );
        break;
      
      case "approved":
      case "sent":
        buttons.push(
          <Button
            key="track"
            variant="outline"
            size="sm"
            onClick={() => onView?.(order)}
          >
            <FiTruck className="w-4 h-4 mr-1" />
            Track
          </Button>
        );
        break;
    }

    buttons.push(
      <Button
        key="view"
        variant="outline"
        size="sm"
        onClick={() => onView?.(order)}
      >
        <FiEye className="w-4 h-4 mr-1" />
        View
      </Button>
    );

    return buttons;
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "sent", label: "Sent" },
    { value: "received", label: "Received" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Purchase Orders</h2>
          <p className="text-sm text-gray-600">
            Manage purchase orders and supplier communications
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order number or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={FiSearch}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.orderNumber}
                    </h3>
                    <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      <span>{order.supplier.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>Created: {order.createdDate}</span>
                    </div>
                    {order.expectedDelivery && (
                      <div className="flex items-center gap-1">
                        <FiTruck className="w-4 h-4" />
                        <span>Expected: {order.expectedDelivery}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ₹{order.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.itemCount} items
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Order Items</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView?.(order)}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FiPackage className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline" size="sm">
                          {item.code}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            setContextualInput({
                              action: "update_quantity",
                              order,
                              field: "quantity",
                              position: { x: rect.left, y: rect.bottom + 5 },
                            });
                          }}
                        >
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{item.unitPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-sm text-gray-500 text-center pt-2">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionButtons(order)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Handle download */}}
                  >
                    <FiDownload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? "No purchase orders" : "No matching orders"}
          </h3>
          <p className="text-gray-600 mb-4">
            {orders.length === 0 
              ? "Create your first purchase order to get started"
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {orders.length === 0 && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          )}
        </div>
      )}

      {/* Contextual Input */}
      {contextualInput && (
        <ContextualInput
          isOpen={true}
          onClose={() => setContextualInput(null)}
          onSubmit={handleContextualSubmit}
          title={`Update ${contextualInput.field}`}
          placeholder={`Enter new ${contextualInput.field}`}
          defaultValue={contextualInput.order[contextualInput.field]?.toString()}
          position={contextualInput.position}
          type="number"
        />
      )}
    </div>
  );
};

export default PurchaseOrders;