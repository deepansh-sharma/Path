import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../contexts/AuthContext";
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  FiHome, 
  FiUsers, 
  FiActivity, 
  FiFileText, 
  FiDollarSign, 
  FiBell, 
  FiSettings, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiBarChart2,
  FiUserPlus,
  FiClipboard,
  FiPrinter,
  FiShield,
  FiBriefcase,
  FiCreditCard,
  FiTrendingUp,
  FiSearch,
  FiCalendar,
  FiMail,
  FiPhone
} from 'react-icons/fi';

const Sidebar = ({ isCollapsed, onToggle, className = '' }) => {
  const { user, logout, hasPermission, hasRole } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  // Define menu items based on user roles
  const getMenuItems = () => {
    const baseItems = [];

    // Dashboard - available to all authenticated users
    baseItems.push({
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiHome,
      path: '/dashboard',
      badge: null,
    });

    // Super Admin specific items
    if (hasRole('super-admin')) {
      baseItems.push(
        {
          id: 'labs',
          label: 'Lab Management',
          icon: FiBriefcase,
          path: '/labs',
          badge: null,
        },
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          icon: FiCreditCard,
          path: '/subscriptions',
          badge: null,
        },
        {
          id: 'global-analytics',
          label: 'Global Analytics',
          icon: FiTrendingUp,
          path: '/analytics/global',
          badge: null,
        }
      );
    }

    // Lab Admin and Staff items
    if (hasRole('lab-admin') || hasRole('technician') || hasRole('receptionist') || hasRole('finance')) {
      // Patient Management
      if (hasPermission('manage-patients') || hasPermission('view-patients')) {
        baseItems.push({
          id: 'patients',
          label: 'Patients',
          icon: FiUsers,
          path: '/patients',
          badge: null,
        });
      }

      // Sample Management
      if (hasPermission('manage-samples')) {
        baseItems.push({
          id: 'samples',
          label: 'Sample Tracking',
          icon: FiActivity,
          path: '/samples',
          badge: { text: 'New', variant: 'success' },
        });
      }

      // Report Management
      if (hasPermission('create-reports') || hasPermission('manage-reports')) {
        baseItems.push({
          id: 'reports',
          label: 'Reports',
          icon: FiFileText,
          path: '/reports',
          badge: null,
        });
      }

      // Invoice Management
      if (hasPermission('manage-invoices') || hasPermission('view-invoices')) {
        baseItems.push({
          id: 'invoices',
          label: 'Invoices',
          icon: FiDollarSign,
          path: '/invoices',
          badge: { text: '3', variant: 'warning' },
        });
      }

      // Staff Management (Lab Admin only)
      if (hasPermission('manage-lab-staff')) {
        baseItems.push({
          id: 'staff',
          label: 'Staff',
          icon: FiUserPlus,
          path: '/staff',
          badge: null,
        });
      }

      // Analytics (Lab level)
      if (hasPermission('view-lab-analytics')) {
        baseItems.push({
          id: 'analytics',
          label: 'Analytics',
          icon: FiBarChart2,
          path: '/analytics',
          badge: null,
        });
      }
    }

    // Common items for all users
    baseItems.push(
      {
        id: 'notifications',
        label: 'Notifications',
        icon: FiBell,
        path: '/notifications',
        badge: { text: '5', variant: 'primary' },
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: FiSettings,
        path: '/settings',
        badge: null,
      }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    // Handle navigation here - typically with React Router
    console.log('Navigate to:', item.path);
  };

  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
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
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className={`bg-white border-r border-gray-200 shadow-sm flex flex-col h-full ${className}`}
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
                <div className="w-8 h-8 bg-gradient-to-r from-healthcare-500 to-healthcare-600 rounded-lg flex items-center justify-center">
                  <FiActivity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">PathoSaaS</h2>
                  <p className="text-xs text-gray-500">Lab Management</p>
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

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-healthcare-400 to-healthcare-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
                </p>
                {user?.lab && (
                  <p className="text-xs text-healthcare-600 truncate">
                    {user.lab}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-healthcare-50 text-healthcare-700 border border-healthcare-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-healthcare-600' : ''}`} />
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={item.badge.variant}
                        size="sm"
                      >
                        {item.badge.text}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Quick Actions */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-2"
            >
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  leftIcon={FiSearch}
                >
                  Search
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  leftIcon={FiMail}
                >
                  Support
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${
            isCollapsed ? 'px-2' : 'justify-start'
          }`}
          leftIcon={FiLogOut}
        >
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;