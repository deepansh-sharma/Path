import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { showToast } from '../components/ui/Toast';
import { 
  FiMail, 
  FiLock, 
  FiArrowLeft, 
  FiArrowRight, 
  FiShield,
  FiCheck,
  FiActivity
} from 'react-icons/fi';

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [otpTimer, setOtpTimer] = useState(0);

  // OTP Timer Effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    
    setFormData(prev => ({
      ...prev,
      otp: newOtp,
    }));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setValidationErrors({ email: 'Email is required' });
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setValidationErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast.success('OTP Sent', 'Please check your email for the verification code');
      setCurrentStep(2);
      setOtpTimer(300); // 5 minutes
    } catch (error) {
      showToast.error('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = formData.otp.join('');
    if (otpString.length !== 6) {
      setValidationErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast.success('OTP Verified', 'Please set your new password');
      setCurrentStep(3);
    } catch (error) {
      showToast.error('Invalid OTP', 'Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (!validatePassword(formData.newPassword)) {
      errors.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast.success('Password Reset', 'Your password has been successfully updated');
      setCurrentStep(4);
    } catch (error) {
      showToast.error('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast.success('OTP Resent', 'A new verification code has been sent to your email');
      setOtpTimer(300);
      setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
    } catch (error) {
      showToast.error('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const renderEmailStep = () => (
    <motion.div
      key="email-step"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-healthcare-100 rounded-full flex items-center justify-center mb-4">
            <FiMail className="w-6 h-6 text-healthcare-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a verification code
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleEmailSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                leftIcon={FiMail}
                error={validationErrors.email}
                disabled={isLoading}
              />
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
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              leftIcon={FiArrowLeft}
              onClick={() => window.history.back()}
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );

  const renderOtpStep = () => (
    <motion.div
      key="otp-step"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-healthcare-100 rounded-full flex items-center justify-center mb-4">
            <FiShield className="w-6 h-6 text-healthcare-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {formData.email}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleOtpSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 text-center block">
                Verification Code
              </label>
              <div className="flex justify-center space-x-2">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-healthcare-500 focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                ))}
              </div>
              {validationErrors.otp && (
                <p className="text-sm text-red-600 text-center">{validationErrors.otp}</p>
              )}
            </div>

            <div className="text-center">
              {otpTimer > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend code in {formatTime(otpTimer)}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={isLoading}
                  className="text-sm text-healthcare-600 hover:text-healthcare-700 font-medium"
                >
                  Resend verification code
                </button>
              )}
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
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              leftIcon={FiArrowLeft}
              onClick={() => setCurrentStep(1)}
            >
              Change Email
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );

  const renderPasswordStep = () => (
    <motion.div
      key="password-step"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-healthcare-100 rounded-full flex items-center justify-center mb-4">
            <FiLock className="w-6 h-6 text-healthcare-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>
            Create a strong password for your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                leftIcon={FiLock}
                error={validationErrors.newPassword}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                leftIcon={FiLock}
                error={validationErrors.confirmPassword}
                disabled={isLoading}
              />
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
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      key="success-step"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Password Reset Successful!
          </CardTitle>
          <CardDescription>
            Your password has been successfully updated. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={() => window.location.href = '/login'}
            rightIcon={FiArrowRight}
          >
            Continue to Login
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-50 via-white to-healthcare-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-healthcare-500 to-healthcare-600 rounded-2xl flex items-center justify-center mb-4">
            <FiActivity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PathoSaaS
          </h1>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center space-x-2 mb-8"
        >
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                step <= currentStep
                  ? 'bg-healthcare-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderEmailStep()}
          {currentStep === 2 && renderOtpStep()}
          {currentStep === 3 && renderPasswordStep()}
          {currentStep === 4 && renderSuccessStep()}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500"
        >
          <p>© 2025 PathoSaaS. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;