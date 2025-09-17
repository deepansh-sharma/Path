import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  FiUser, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiShield, 
  FiUsers, 
  FiActivity,
  FiMail,
  FiArrowRight
} from 'react-icons/fi';

const Login = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('lab-admin');
  const [validationErrors, setValidationErrors] = useState({});

  // Clear errors when component mounts or form changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (formData.email || formData.password) {
      setValidationErrors({});
    }
  }, [formData]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // This would typically be handled by a router
      console.log('User is authenticated, redirect to dashboard');
    }
  }, [isAuthenticated]);

  const userTypes = [
    {
      id: 'super-admin',
      title: 'Super Admin',
      description: 'Manage all labs and subscriptions',
      icon: FiShield,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      id: 'lab-admin',
      title: 'Lab Admin',
      description: 'Manage your pathology lab',
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'staff',
      title: 'Staff',
      description: 'Access lab operations',
      icon: FiActivity,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
  ];

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData, selectedRole);
    
    if (result.success) {
      // Handle successful login - typically redirect
      console.log('Login successful:', result.user);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-50 via-white to-healthcare-100 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-6"
      >
        {/* Logo and Header */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-healthcare-500 to-healthcare-600 rounded-2xl flex items-center justify-center mb-4">
            <FiActivity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PathoSaaS
          </h1>
          <p className="text-gray-600">
            Sign in to your pathology lab management system
          </p>
        </motion.div>

        {/* Role Selection */}
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
                      ? 'border-healthcare-500 bg-healthcare-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${type.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${type.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                    {selectedRole === type.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-healthcare-500 rounded-full flex items-center justify-center"
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

        {/* Login Form */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    leftIcon={FiMail}
                    error={validationErrors.email}
                    disabled={isLoading}
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    leftIcon={FiLock}
                    rightIcon={showPassword ? FiEyeOff : FiEye}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    error={validationErrors.password}
                    disabled={isLoading}
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-healthcare-600 hover:text-healthcare-700 font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                  rightIcon={isLoading ? undefined : FiArrowRight}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Need help?{' '}
                  <button
                    type="button"
                    className="text-healthcare-600 hover:text-healthcare-700 font-medium"
                  >
                    Contact Support
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center text-sm text-gray-500">
          <p>© 2025 PathoSaaS. All rights reserved.</p>
          <p className="mt-1">
            Secure pathology lab management for healthcare professionals
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;