import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Modal } from "../../../components/ui/Modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import InventoryStats from "../components/InventoryStats";
import ItemsTable from "../components/ItemsTable";
import SuppliersTable from "../components/SuppliersTable";
import CategoriesManager from "../components/CategoriesManager";
import StockAlerts from "../components/StockAlerts";
import PurchaseOrders from "../components/PurchaseOrders";
import ContextualInput from "../../../components/ui/ContextualInput";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiPackage,
  FiTruck,
  FiTag,
  FiAlertTriangle,
  FiFileText,
  FiBarChart3,
  FiSettings,
  FiGrid,
  FiList,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const InventoryManagement = () => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Contextual input states
  const [contextualInputs, setContextualInputs] = useState({});

  // Sample data - In real app, this would come from API
  const [inventoryData, setInventoryData] = useState({
    items: [
      {
        id: "ITM001",
        name: "Blood Collection Tubes",
        category: "Consumables",
        supplier: "MedSupply Co.",
        currentStock: 150,
        minStock: 50,
        maxStock: 500,
        unit: "pieces",
        unitPrice: 2.50,
        lastRestocked: "2024-01-15",
        expiryDate: "2025-01-15",
        status: "in_stock",
        location: "Storage A-1",
        barcode: "123456789012",
      },
      {
        id: "ITM002",
        name: "Reagent Kit - CBC",
        category: "Reagents",
        supplier: "LabTech Solutions",
        currentStock: 25,
        minStock: 30,
        maxStock: 100,
        unit: "kits",
        unitPrice: 45.00,
        lastRestocked: "2024-01-10",
        expiryDate: "2024-12-31",
        status: "low_stock",
        location: "Refrigerator B-2",
        barcode: "123456789013",
      },
      {
        id: "ITM003",
        name: "Microscope Slides",
        category: "Equipment",
        supplier: "GlassWorks Ltd",
        currentStock: 0,
        minStock: 100,
        maxStock: 1000,
        unit: "pieces",
        unitPrice: 0.75,
        lastRestocked: "2023-12-20",
        expiryDate: null,
        status: "out_of_stock",
        location: "Storage C-3",
        barcode: "123456789014",
      },
    ],
    suppliers: [
      {
        id: "SUP001",
        name: "MedSupply Co.",
        contact: "John Smith",
        email: "john@medsupply.com",
        phone: "+1-555-0123",
        address: "123 Medical St, Health City",
        status: "active",
        rating: 4.5,
        totalOrders: 45,
        lastOrder: "2024-01-15",
      },
      {
        id: "SUP002",
        name: "LabTech Solutions",
        contact: "Sarah Johnson",
        email: "sarah@labtech.com",
        phone: "+1-555-0124",
        address: "456 Lab Ave, Science Park",
        status: "active",
        rating: 4.8,
        totalOrders: 32,
        lastOrder: "2024-01-10",
      },
    ],
    categories: [
      { id: "CAT001", name: "Consumables", itemCount: 45, description: "Single-use items" },
      { id: "CAT002", name: "Reagents", itemCount: 23, description: "Chemical reagents and kits" },
      { id: "CAT003", name: "Equipment", itemCount: 12, description: "Reusable equipment" },
    ],
  });

  // Handle contextual input
  const handleContextualInput = (key, value, type = "text") => {
    setContextualInputs(prev => ({
      ...prev,
      [key]: { value, type, active: true }
    }));
  };

  const closeContextualInput = (key) => {
    setContextualInputs(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // Filter and sort items
  const getFilteredItems = () => {
    let filtered = inventoryData.items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Supplier filter
    if (selectedSupplier !== "all") {
      filtered = filtered.filter(item => item.supplier === selectedSupplier);
    }

    // Stock filter
    if (stockFilter !== "all") {
      filtered = filtered.filter(item => item.status === stockFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Get stock status badge
  const getStockStatusBadge = (status) => {
    const statusConfig = {
      in_stock: { variant: "success", text: "In Stock" },
      low_stock: { variant: "warning", text: "Low Stock" },
      out_of_stock: { variant: "danger", text: "Out of Stock" },
      expired: { variant: "danger", text: "Expired" },
    };

    const config = statusConfig[status] || statusConfig.in_stock;
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems);
    // Implement bulk action logic
  };

  // Export data
  const handleExport = (format) => {
    console.log(`Exporting inventory data in ${format} format`);
    // Implement export logic
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">
            Track items, monitor stock levels, and manage suppliers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Import
          </Button>
          <Button
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <InventoryStats data={inventoryData} />

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Items
                </label>
                <Input
                  placeholder="Search by name, ID, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={FiSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {inventoryData.categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Status
                </label>
                <Select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1"
                  >
                    <option value="name">Name</option>
                    <option value="currentStock">Stock Level</option>
                    <option value="lastRestocked">Last Restocked</option>
                    <option value="unitPrice">Price</option>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3"
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FiGrid className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <FiPackage className="w-4 h-4" />
            Items
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <FiTruck className="w-4 h-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FiTag className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <FiFileText className="w-4 h-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAddItemModal(true)}
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAddSupplierModal(true)}
                >
                  <FiTruck className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("csv")}
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Export Inventory
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FiPackage className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Blood Collection Tubes restocked</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">+150 units</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <FiAlertTriangle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Low stock alert: Reagent Kit - CBC</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">25 left</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <ItemsTable
            items={filteredItems}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onBulkAction={handleBulkAction}
            contextualInputs={contextualInputs}
            onContextualInput={handleContextualInput}
            onCloseContextualInput={closeContextualInput}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersTable
            suppliers={inventoryData.suppliers}
            contextualInputs={contextualInputs}
            onContextualInput={handleContextualInput}
            onCloseContextualInput={closeContextualInput}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesManager
            categories={inventoryData.categories}
            contextualInputs={contextualInputs}
            onContextualInput={handleContextualInput}
            onCloseContextualInput={closeContextualInput}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <StockAlerts items={inventoryData.items} />
        </TabsContent>

        <TabsContent value="orders">
          <PurchaseOrders />
        </TabsContent>
      </Tabs>

      {/* Contextual Inputs */}
      <AnimatePresence>
        {Object.entries(contextualInputs).map(([key, input]) => (
          <ContextualInput
            key={key}
            isOpen={input.active}
            onClose={() => closeContextualInput(key)}
            value={input.value}
            type={input.type}
            placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
            onSubmit={(value) => {
              console.log(`Contextual input ${key}:`, value);
              closeContextualInput(key);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default InventoryManagement;