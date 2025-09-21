import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiUsers,
  FiActivity,
  FiMail,
  FiArrowRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("lab-admin");
  const [validationErrors, setValidationErrors] = useState({});

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const userTypes = [
    {
      id: "super-admin",
      title: "Super Admin",
      description: "Manage all labs and subscriptions",
      icon: FiShield,
    },
    {
      id: "lab-admin",
      title: "Lab Admin",
      description: "Manage your pathology lab",
      icon: FiUsers,
    },
    {
      id: "staff",
      title: "Staff",
      description: "Access lab operations",
      icon: FiActivity,
    },
  ];

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    await login(formData, selectedRole);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error on input change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <FiActivity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">PathoSaaS</h1>
          <p className="text-gray-500">
            Sign in to your pathology lab management system
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Select Your Role
          </label>
          <div className="grid grid-cols-1 gap-3">
            {userTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedRole(type.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedRole === type.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-blue-100`}>
                      <IconComponent className={`w-5 h-5 text-blue-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {type.description}
                      </p>
                    </div>
                    {selectedRole === type.id && (
                      <motion.div
                        layoutId="role-indicator"
                        className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-800">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
                    >
                      <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-red-700 font-medium">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    leftIcon={<FiMail />}
                    error={validationErrors.email}
                    disabled={isLoading}
                    label="Email Address"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    leftIcon={<FiLock />}
                    rightIcon={showPassword ? <FiEyeOff /> : <FiEye />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    error={validationErrors.password}
                    disabled={isLoading}
                    label="Password"
                  />
                </div>

                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-gray-500"
        >
          <p>© {new Date().getFullYear()} PathoSaaS. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
