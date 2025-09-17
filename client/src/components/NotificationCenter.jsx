import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiX, FiCheck, FiAlertCircle, FiInfo, FiCheckCircle,
  FiClock, FiUser, FiFileText, FiDollarSign, FiSettings,
  FiTrash2, FiMarkAsRead, FiFilter, FiSearch
} from 'react-icons/fi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';

// Toast Component
export const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-600" size={20} />;
      case 'error':
        return <FiAlertCircle className="text-red-600" size={20} />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-600" size={20} />;
      default:
        return <FiInfo className="text-blue-600" size={20} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getToastStyles()}`}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FiX size={16} />
      </button>
    </motion.div>
  );
};

// Toast Container
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return { toasts, removeToast, toast };
};

// Notification Bell Component
export const NotificationBell = ({ notifications, onToggle, isOpen }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen 
            ? 'bg-blue-100 text-blue-600' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>
    </div>
  );
};

// Main Notification Center Component
const NotificationCenter = ({ isOpen, onClose, className = '' }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const panelRef = useRef(null);

  // Mock notifications data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'test_result',
        title: 'New Test Results Available',
        message: 'Blood test results for John Doe (P001) are ready for review.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        priority: 'high',
        actionUrl: '/patients/P001/results',
        icon: FiFileText,
        color: 'blue'
      },
      {
        id: 2,
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'Jane Smith has an appointment in 30 minutes.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        priority: 'medium',
        actionUrl: '/appointments',
        icon: FiClock,
        color: 'yellow'
      },
      {
        id: 3,
        type: 'payment',
        title: 'Payment Received',
        message: 'Invoice INV-2024-001 has been paid by Mike Johnson.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        priority: 'low',
        actionUrl: '/invoices/INV-2024-001',
        icon: FiDollarSign,
        color: 'green'
      },
      {
        id: 4,
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: 'medium',
        actionUrl: '/system/maintenance',
        icon: FiSettings,
        color: 'purple'
      },
      {
        id: 5,
        type: 'alert',
        title: 'Critical Sample Alert',
        message: 'Sample S001 requires immediate attention - abnormal values detected.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        read: false,
        priority: 'urgent',
        actionUrl: '/samples/S001',
        icon: FiAlertCircle,
        color: 'red'
      },
      {
        id: 6,
        type: 'user',
        title: 'New User Registration',
        message: 'Dr. Sarah Wilson has registered and is pending approval.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        priority: 'low',
        actionUrl: '/users/pending',
        icon: FiUser,
        color: 'indigo'
      },
      {
        id: 7,
        type: 'test_result',
        title: 'Urgent Test Results',
        message: 'Critical values detected in pathology report for Sarah Brown (P004).',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: false,
        priority: 'urgent',
        actionUrl: '/patients/P004/results',
        icon: FiFileText,
        color: 'red'
      },
      {
        id: 8,
        type: 'payment',
        title: 'Overdue Invoice',
        message: 'Invoice INV-2024-003 is now 5 days overdue.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: 'high',
        actionUrl: '/invoices/INV-2024-003',
        icon: FiDollarSign,
        color: 'red'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Filter by status
    if (filterStatus === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(notification => notification.read);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterType, filterStatus]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIconColor = (color) => {
    switch (color) {
      case 'red': return 'text-red-600 bg-red-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiBell className="text-blue-600" />
              Notifications
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
              size="sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="test_result">Test Results</option>
              <option value="appointment">Appointments</option>
              <option value="payment">Payments</option>
              <option value="system">System</option>
              <option value="alert">Alerts</option>
              <option value="user">Users</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <FiCheck size={14} />
              Mark All Read
            </Button>
            <Button
              onClick={clearAllNotifications}
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-red-600 hover:bg-red-50"
            >
              <FiTrash2 size={14} />
              Clear All
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FiBell size={48} className="mb-4 opacity-50" />
              <p className="text-sm">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              <AnimatePresence>
                {filteredNotifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        notification.read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-blue-200 shadow-sm'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        // Navigate to action URL if needed
                        if (notification.actionUrl) {
                          console.log('Navigate to:', notification.actionUrl);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getIconColor(notification.color)}`}>
                          <IconComponent size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </Badge>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm"
            onClick={() => console.log('View all notifications')}
          >
            View All Notifications
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationCenter;