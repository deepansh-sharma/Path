import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { 
  FiSearch, 
  FiBell, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiMenu,
  FiChevronDown,
  FiMoon,
  FiSun,
  FiMaximize,
  FiMinimize,
  FiRefreshCw,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiActivity
} from 'react-icons/fi';

const Header = ({ onSidebarToggle, className = '' }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New Report Ready',
      message: 'Blood test report for John Doe is ready for review',
      time: '2 minutes ago',
      type: 'success',
      unread: true,
    },
    {
      id: 2,
      title: 'Sample Received',
      message: 'New sample #SAM-2025-001 has been received',
      time: '15 minutes ago',
      type: 'info',
      unread: true,
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'Invoice #INV-001 has been paid',
      time: '1 hour ago',
      type: 'success',
      unread: false,
    },
    {
      id: 4,
      title: 'System Update',
      message: 'System maintenance scheduled for tonight',
      time: '2 hours ago',
      type: 'warning',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  };

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <FiMenu className="w-5 h-5" />
          </Button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search patients, samples, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={FiSearch}
                className="w-80 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </form>
        </div>

        {/* Center Section - Breadcrumb or Page Title */}
        <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Overview</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-900"
            >
              <FiRefreshCw className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-gray-600 hover:text-gray-900"
            >
              {isFullscreen ? (
                <FiMinimize className="w-4 h-4" />
              ) : (
                <FiMaximize className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isDarkMode ? (
                <FiSun className="w-4 h-4" />
              ) : (
                <FiMoon className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative text-gray-600 hover:text-gray-900"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="primary"
                  size="sm"
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-80 z-50"
                >
                  <Card className="shadow-lg border-0 ring-1 ring-black ring-opacity-5">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <Badge variant="primary" size="sm">
                            {unreadCount} new
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-0 max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    
                    <div className="p-4 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-healthcare-600 hover:text-healthcare-700"
                      >
                        View All Notifications
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-healthcare-400 to-healthcare-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
                </p>
              </div>
              <FiChevronDown className="w-4 h-4" />
            </Button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-64 z-50"
                >
                  <Card className="shadow-lg border-0 ring-1 ring-black ring-opacity-5">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-healthcare-400 to-healthcare-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email || 'user@example.com'}
                          </p>
                          <p className="text-xs text-healthcare-600 truncate">
                            {user?.role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          leftIcon={FiUser}
                        >
                          Profile Settings
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          leftIcon={FiSettings}
                        >
                          Account Settings
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          leftIcon={FiHelpCircle}
                        >
                          Help & Support
                        </Button>

                        <div className="border-t border-gray-200 my-2"></div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLogout}
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          leftIcon={FiLogOut}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-6 pb-4">
        <form onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={FiSearch}
            className="w-full bg-gray-50 border-gray-200 focus:bg-white"
          />
        </form>
      </div>
    </header>
  );
};

export default Header;