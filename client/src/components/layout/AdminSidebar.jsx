import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  FiHome,
  FiActivity,
  FiPackage,
  FiUsers,
  FiClipboard,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiGrid,
  FiBookOpen,
  FiZap,
  FiTool,
  FiLayers,
  FiTrendingUp,
  FiShoppingCart,
  FiTruck,
  FiTag,
  FiDatabase,
  FiFileText,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";

const AdminSidebar = ({ isCollapsed, onToggle, className = "" }) => {
  const { user, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    testManagement: true,
    inventory: false,
    analytics: false,
    settings: false,
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if current path matches menu item
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  // Define admin menu sections with logical grouping
  const getAdminMenuSections = () => {
    const sections = [];

    // Dashboard
    sections.push({
      id: "dashboard",
      type: "single",
      label: "Dashboard",
      icon: FiHome,
      path: "/lab-admin/dashboard",
      badge: null,
      permission: null,
    });

    // Test Management Section
    if (hasPermission("manage-tests")) {
      sections.push({
        id: "testManagement",
        type: "expandable",
        label: "Test Management",
        icon: FiActivity,
        expanded: expandedSections.testManagement,
        items: [
          {
            id: "tests-overview",
            label: "Test Overview",
            icon: FiGrid,
            path: "/lab-admin/tests",
            badge: { text: "Active", variant: "success" },
          },
          {
            id: "quick-create",
            label: "Quick Create",
            icon: FiPlus,
            path: "/lab-admin/tests?tab=create",
            badge: null,
          },
          {
            id: "test-packages",
            label: "Test Packages",
            icon: FiPackage,
            path: "/lab-admin/tests?tab=packages",
            badge: null,
          },
          {
            id: "test-templates",
            label: "Templates",
            icon: FiBookOpen,
            path: "/lab-admin/tests/templates",
            badge: null,
          },
          {
            id: "bulk-operations",
            label: "Bulk Operations",
            icon: FiZap,
            path: "/lab-admin/tests/bulk",
            badge: null,
          },
          {
            id: "test-categories",
            label: "Categories",
            icon: FiLayers,
            path: "/lab-admin/tests/categories",
            badge: null,
          },
        ],
      });
    }

    // Inventory Management Section
    if (hasPermission("manage-inventory") || hasRole("lab_admin")) {
      sections.push({
        id: "inventory",
        type: "expandable",
        label: "Inventory Management",
        icon: FiPackage,
        expanded: expandedSections.inventory,
        items: [
          {
            id: "inventory-overview",
            label: "Inventory Overview",
            icon: FiDatabase,
            path: "/lab-admin/inventory",
            badge: { text: "Low Stock", variant: "warning" },
          },
          {
            id: "items",
            label: "Items & Stock",
            icon: FiShoppingCart,
            path: "/lab-admin/inventory/items",
            badge: null,
          },
          {
            id: "suppliers",
            label: "Suppliers",
            icon: FiTruck,
            path: "/lab-admin/inventory/suppliers",
            badge: null,
          },
          {
            id: "categories",
            label: "Item Categories",
            icon: FiTag,
            path: "/lab-admin/inventory/categories",
            badge: null,
          },
          {
            id: "purchase-orders",
            label: "Purchase Orders",
            icon: FiFileText,
            path: "/lab-admin/inventory/orders",
            badge: { text: "3", variant: "primary" },
          },
          {
            id: "stock-alerts",
            label: "Stock Alerts",
            icon: FiAlertCircle,
            path: "/lab-admin/inventory/alerts",
            badge: { text: "5", variant: "danger" },
          },
        ],
      });
    }

    // Patient Management
    if (hasPermission("manage-patients")) {
      sections.push({
        id: "patients",
        type: "single",
        label: "Patient Management",
        icon: FiUsers,
        path: "/lab-admin/patients",
        badge: null,
      });
    }

    // Sample Tracking
    if (hasPermission("manage-samples")) {
      sections.push({
        id: "samples",
        type: "single",
        label: "Sample Tracking",
        icon: FiClipboard,
        path: "/lab-admin/samples",
        badge: { text: "New", variant: "success" },
      });
    }

    // Analytics Section
    if (hasPermission("view-lab-analytics")) {
      sections.push({
        id: "analytics",
        type: "expandable",
        label: "Analytics & Reports",
        icon: FiBarChart2,
        expanded: expandedSections.analytics,
        items: [
          {
            id: "dashboard-analytics",
            label: "Dashboard",
            icon: FiTrendingUp,
            path: "/lab-admin/analytics",
            badge: null,
          },
          {
            id: "test-analytics",
            label: "Test Performance",
            icon: FiActivity,
            path: "/lab-admin/analytics/tests",
            badge: null,
          },
          {
            id: "inventory-analytics",
            label: "Inventory Reports",
            icon: FiPackage,
            path: "/lab-admin/analytics/inventory",
            badge: null,
          },
          {
            id: "scheduled-reports",
            label: "Scheduled Reports",
            icon: FiCalendar,
            path: "/lab-admin/analytics/scheduled",
            badge: null,
          },
        ],
      });
    }

    // Settings Section
    sections.push({
      id: "settings",
      type: "expandable",
      label: "Settings & Config",
      icon: FiSettings,
      expanded: expandedSections.settings,
      items: [
        {
          id: "lab-settings",
          label: "Lab Settings",
          icon: FiTool,
          path: "/lab-admin/settings/lab",
          badge: null,
        },
        {
          id: "user-preferences",
          label: "User Preferences",
          icon: FiUsers,
          path: "/lab-admin/settings/preferences",
          badge: null,
        },
        {
          id: "system-config",
          label: "System Config",
          icon: FiSettings,
          path: "/lab-admin/settings/system",
          badge: null,
        },
      ],
    });

    return sections;
  };

  const menuSections = getAdminMenuSections();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const sidebarVariants = {
    expanded: {
      width: 320,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1,
      },
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className={`bg-white border-r border-gray-200 shadow-lg flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiActivity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                  <p className="text-xs text-gray-500">Test Management</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <FiChevronRight className="w-4 h-4" />
            ) : (
              <FiChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuSections.map((section) => {
          if (section.type === "single") {
            const IconComponent = section.icon;
            return (
              <motion.button
                key={section.id}
                onClick={() => handleNavigation(section.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive(section.path)
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="flex items-center justify-between flex-1"
                    >
                      <span className="text-sm font-medium">{section.label}</span>
                      {section.badge && (
                        <Badge variant={section.badge.variant} size="sm">
                          {section.badge.text}
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          }

          if (section.type === "expandable") {
            const IconComponent = section.icon;
            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                <motion.button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="flex items-center justify-between flex-1"
                      >
                        <span className="text-sm font-medium">{section.label}</span>
                        {section.expanded ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Section Items */}
                <AnimatePresence>
                  {section.expanded && !isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 space-y-1"
                    >
                      {section.items.map((item) => {
                        const ItemIcon = item.icon || FiActivity; // Fallback icon
                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                              isActive(item.path)
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {ItemIcon && <ItemIcon className="w-4 h-4 flex-shrink-0" />}
                            <div className="flex items-center justify-between flex-1">
                              <span className="text-sm">{item.label}</span>
                              {item.badge && (
                                <Badge variant={item.badge.variant} size="xs">
                                  {item.badge.text}
                                </Badge>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="text-center"
            >
              <p className="text-xs text-gray-500">
                Admin Panel v2.0
              </p>
              <p className="text-xs text-gray-400">
                Enhanced Interface
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;