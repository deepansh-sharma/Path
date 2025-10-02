import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { ContextualInput } from "../../../components/ui/ContextualInput";
import {
  FiEdit3,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiTruck,
  FiStar,
} from "react-icons/fi";

const SuppliersTable = ({ suppliers = [], onEdit, onDelete, onUpdate }) => {
  const [contextualInput, setContextualInput] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContextualAction = (action, supplier, field) => {
    setContextualInput({
      action,
      supplier,
      field,
      position: { x: 0, y: 0 }, // Will be updated by click position
    });
  };

  const handleContextualSubmit = (value) => {
    if (contextualInput && onUpdate) {
      onUpdate(contextualInput.supplier.id, {
        [contextualInput.field]: value
      });
    }
    setContextualInput(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "secondary";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {supplier.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {supplier.category}
                  </p>
                  <Badge variant={getStatusColor(supplier.status)} size="sm">
                    {supplier.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {getRatingStars(supplier.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({supplier.rating})
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUser className="w-4 h-4" />
                  <span>{supplier.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="w-4 h-4" />
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setContextualInput({
                        action: "update_phone",
                        supplier,
                        field: "phone",
                        position: { x: rect.left, y: rect.bottom + 5 },
                      });
                    }}
                  >
                    {supplier.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="w-4 h-4" />
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setContextualInput({
                        action: "update_email",
                        supplier,
                        field: "email",
                        position: { x: rect.left, y: rect.bottom + 5 },
                      });
                    }}
                  >
                    {supplier.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMapPin className="w-4 h-4" />
                  <span className="truncate">{supplier.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {supplier.totalOrders}
                  </div>
                  <div className="text-xs text-gray-600">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{supplier.totalValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Total Value</div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiDollarSign className="w-4 h-4" />
                  <span>Payment: {supplier.paymentTerms} days</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiTruck className="w-4 h-4" />
                  <span>{supplier.deliveryTime} days</span>
                </div>
              </div>

              {/* Last Order */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <FiCalendar className="w-4 h-4" />
                <span>Last order: {supplier.lastOrderDate}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(supplier)}
                  className="flex-1"
                >
                  <FiEdit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(supplier)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No suppliers found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Add your first supplier to get started"}
          </p>
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
          defaultValue={contextualInput.supplier[contextualInput.field]}
          position={contextualInput.position}
          type={contextualInput.field === "email" ? "email" : "text"}
        />
      )}
    </div>
  );
};

export default SuppliersTable;