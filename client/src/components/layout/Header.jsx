import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
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
} from "react-icons/fi";
import { toast } from "../ui/Toast";

const Header = ({ onSidebarToggle, className = "" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Initialize navigate
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Apply dark mode class to the root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", JSON.stringify(true));
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", JSON.stringify(false));
    }
  }, [isDarkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New Report Ready",
      message: "Blood test report for John Doe is ready.",
      time: "2m ago",
      type: "success",
      unread: true,
    },
    {
      id: 2,
      title: "Sample Received",
      message: "New sample #SAM-2025-001 received.",
      time: "15m ago",
      type: "info",
      unread: true,
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Invoice #INV-001 has been paid.",
      time: "1h ago",
      type: "success",
      unread: false,
    },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully!");
    navigate("/login");
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsUserMenuOpen(false);
  };

  const getNotificationIcon = (type) => {
    /* ... same as before ... */
  };

  const dropdownVariants = {
    /* ... same as before ... */
  };

  return (
    <header
      className={`bg-white border-b border-gray-200 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <FiMenu className="w-5 h-5" />
          </Button>
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<FiSearch />}
                className="w-80 bg-gray-50"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
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
          >
            {isDarkMode ? (
              <FiSun className="w-4 h-4" />
            ) : (
              <FiMoon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full"
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
                  <Card className="shadow-lg">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <CardContent className="p-0 max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                            n.unread ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-gray-500">{n.message}</p>
                        </div>
                      ))}
                    </CardContent>
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
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
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
                  <Card className="shadow-lg">
                    <div className="p-4 border-b">
                      <p className="font-semibold truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                    <CardContent className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => navigateTo("/profile-settings")}
                      >
                        <FiUser className="w-4 h-4 mr-2" /> Profile Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => navigateTo("/account-settings")}
                      >
                        <FiSettings className="w-4 h-4 mr-2" /> Account Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => navigateTo("/help-support")}
                      >
                        <FiHelpCircle className="w-4 h-4 mr-2" /> Help & Support
                      </Button>
                      <div className="border-t my-2"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-600 hover:text-red-700"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" /> Sign Out
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
