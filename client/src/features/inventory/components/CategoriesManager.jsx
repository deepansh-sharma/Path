import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { ContextualInput } from "../../../components/ui/ContextualInput";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiFolder,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";

const CategoriesManager = ({ categories = [], onAdd, onEdit, onDelete, onUpdate }) => {
  const [contextualInput, setContextualInput] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentId: null,
  });

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      onAdd?.(newCategory);
      setNewCategory({ name: "", description: "", parentId: null });
      setShowAddForm(false);
    }
  };

  const handleContextualAction = (action, category, field) => {
    setContextualInput({
      action,
      category,
      field,
      position: { x: 0, y: 0 },
    });
  };

  const handleContextualSubmit = (value) => {
    if (contextualInput && onUpdate) {
      onUpdate(contextualInput.category.id, {
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
      default:
        return "default";
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FiTrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <FiTrendingDown className="w-4 h-4 text-red-500" />;
    return <FiMinus className="w-4 h-4 text-gray-400" />;
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="mb-2">
        <Card className={`p-4 ${level > 0 ? 'ml-6 border-l-4 border-blue-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className="p-1"
                >
                  {isExpanded ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              <FiFolder className="w-5 h-5 text-blue-600" />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 
                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setContextualInput({
                        action: "update_name",
                        category,
                        field: "name",
                        position: { x: rect.left, y: rect.bottom + 5 },
                      });
                    }}
                  >
                    {category.name}
                  </h3>
                  <Badge variant={getStatusColor(category.status)} size="sm">
                    {category.status}
                  </Badge>
                </div>
                
                {category.description && (
                  <p 
                    className="text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setContextualInput({
                        action: "update_description",
                        category,
                        field: "description",
                        position: { x: rect.left, y: rect.bottom + 5 },
                      });
                    }}
                  >
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mr-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <FiPackage className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{category.itemCount}</span>
                </div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1">
                  {getTrendIcon(category.trend)}
                  <span className="text-sm font-medium">
                    {Math.abs(category.trend)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">Trend</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(category)}
              >
                <FiEdit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(category)}
                className="text-red-600 hover:text-red-700"
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.children.map(child => renderCategory(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600">
            Organize your inventory items into categories
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Add Category Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Add New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    name: e.target.value
                  })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    description: e.target.value
                  })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAddCategory}>
                  Add Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCategory({ name: "", description: "", parentId: null });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map(category => renderCategory(category))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first category to organize your inventory
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
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
          defaultValue={contextualInput.category[contextualInput.field]}
          position={contextualInput.position}
          type={contextualInput.field === "description" ? "textarea" : "text"}
        />
      )}
    </div>
  );
};

export default CategoriesManager;