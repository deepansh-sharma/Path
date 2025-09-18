import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiStar,
  FiUsers,
  FiShield,
  FiTrendingUp,
  FiClock,
  FiPhone,
  FiMail,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiMenu,
  FiX,
  FiUser,
  FiActivity,
  FiBarChart2,
  FiFileText,
  FiCreditCard,
  FiBell,
  FiCamera,
  FiZap,
  FiTarget,
  FiAward,
  FiGlobe,
  FiLayers,
  FiDatabase,
} from "react-icons/fi";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [typedText, setTypedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const isStatsInView = useInView(statsRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });

  // Typing animation texts
  const typingTexts = [
    "Pathology Management",
    "Lab Operations",
    "Sample Tracking",
    "Report Generation",
    "Staff Coordination",
  ];

  // Typing animation effect
  useEffect(() => {
    const currentText = typingTexts[currentTextIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    const timer = setTimeout(() => {
      if (!isDeleting && typedText === currentText) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && typedText === "") {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
      } else {
        setTypedText((prev) =>
          isDeleting ? prev.slice(0, -1) : currentText.slice(0, prev.length + 1)
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, currentTextIndex]);

  // Professional features
  const features = [
    {
      icon: FiUser,
      title: "Patient Management",
      description:
        "Comprehensive patient records with automated appointment scheduling and medical history tracking.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: FiUsers,
      title: "Staff Management",
      description:
        "Role-based access control with staff scheduling, performance tracking, and communication tools.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: FiCamera,
      title: "Sample Tracking",
      description:
        "Advanced barcode system with real-time sample tracking and chain of custody management.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: FiFileText,
      title: "Report Generation",
      description:
        "Automated report creation with customizable templates and digital signature capabilities.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: FiCreditCard,
      title: "Billing & Invoicing",
      description:
        "Streamlined billing process with automated invoice generation and payment tracking.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: FiBarChart2,
      title: "Analytics & Reports",
      description:
        "Comprehensive analytics dashboard with business insights and performance metrics.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  // Professional pricing plans
  const pricingPlans = [
    {
      name: "Starter",
      price: "₹1,999",
      period: "/month",
      description: "Perfect for small pathology labs",
      features: [
        "Up to 1 Lab Location",
        "Up to 10 Staff Members",
        "Basic Report Templates",
        "Email Notifications",
        "Patient Management",
        "Basic Analytics",
        "Email Support",
      ],
      popular: false,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Professional",
      price: "₹4,999",
      period: "/month",
      description: "Ideal for growing lab networks",
      features: [
        "Up to 5 Lab Locations",
        "Unlimited Staff Members",
        "Advanced Report Templates",
        "SMS & Email Notifications",
        "Sample Tracking",
        "Advanced Analytics",
        "Priority Support",
        "Custom Branding",
        "API Access",
      ],
      popular: true,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Enterprise",
      price: "₹9,999",
      period: "/month",
      description: "Complete solution for large organizations",
      features: [
        "Unlimited Lab Locations",
        "Unlimited Staff Members",
        "Custom Report Templates",
        "Multi-channel Notifications",
        "Advanced Sample Tracking",
        "Business Intelligence",
        "24/7 Phone Support",
        "White-label Solution",
        "Custom Integrations",
        "Dedicated Account Manager",
      ],
      popular: false,
      color: "from-green-500 to-green-600",
    },
  ];

  // Professional testimonials
  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Chief Pathologist",
      company: "Apollo Diagnostics",
      content:
        "PathoSaaS has revolutionized our lab operations. The efficiency gains are remarkable.",
      avatar: "RK",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Dr. Priya Sharma",
      role: "Lab Director",
      company: "Max Healthcare",
      content:
        "The sample tracking system has eliminated errors and improved our turnaround time significantly.",
      avatar: "PS",
      color: "from-green-500 to-green-600",
    },
    {
      name: "Dr. Amit Patel",
      role: "Laboratory Manager",
      company: "Fortis Healthcare",
      content:
        "Outstanding platform with excellent customer support. Highly recommended for any pathology lab.",
      avatar: "AP",
      color: "from-purple-500 to-purple-600",
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PathoSaaS
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
              </a>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 py-4"
              >
                <div className="flex flex-col space-y-4">
                  <a
                    href="#features"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Pricing
                  </a>
                  <a
                    href="#testimonials"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Testimonials
                  </a>
                  <a
                    href="#contact"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Contact
                  </a>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg w-fit">
                    Get Started
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative py-20 md:py-28 lg:py-32 overflow-hidden min-h-screen flex items-center justify-center"
        style={{ y: heroY }}
      >
        {/* Modern Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"></div>
        
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Floating elements */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-8 h-8 bg-blue-500 rounded-full opacity-20"
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-purple-500 rounded-full opacity-20"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6 md:mb-8"
              >
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  🚀 Trusted by 500+ Labs Worldwide
                </Badge>
              </motion.div>

              <div className="mb-6 md:mb-8">
                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <span className="relative">
                    Streamline Your
                    <motion.span 
                      className="absolute -z-10 w-full h-3 bg-blue-200/60 bottom-2 left-0 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1, duration: 0.8 }}
                    />
                  </span>
                </motion.h1>
                <div className="mt-2 sm:mt-4 h-16 sm:h-20 md:h-24 lg:h-28 flex items-center justify-center lg:justify-start overflow-hidden">
                  <motion.span 
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent inline-flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {typedText}
                    <motion.span
                      className="inline-block w-1 md:w-2 bg-gradient-to-r from-blue-600 to-purple-600 ml-1 md:ml-2"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ height: "1em" }}
                    />
                  </motion.span>
                </div>
              </div>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-xl lg:max-w-2xl mx-auto lg:mx-0 font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Transform your pathology lab with our comprehensive SaaS
                platform. Manage patients, track samples, generate reports, and
                streamline operations with enterprise-grade security.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-5 mb-8 sm:mb-12 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 group relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <span className="relative z-10">Start Free Trial</span>
                  <FiArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-3 group backdrop-blur-sm bg-white/80 shadow-md hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="relative rounded-full bg-blue-100 p-2 group-hover:bg-blue-200 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FiPlay className="w-4 h-4 text-blue-600" />
                  </motion.div>
                  <span>Watch Demo</span>
                </motion.button>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-4 md:gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.div 
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">HIPAA Compliant</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">99.9% Uptime</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">24/7 Support</span>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Floating Elements */}
              <motion.div
                className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl"
                animate={{ y: [-10, 10, -10], rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <FiActivity className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ y: [10, -10, 10], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <FiZap className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ y: [-8, 8, -8], x: [-5, 5, -5] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              >
                <FiTarget className="w-7 h-7 text-white" />
              </motion.div>

              {/* Main Dashboard Mockup */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="ml-4 text-sm text-gray-500 font-medium">
                      PathoSaaS Dashboard
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-2/3 mt-2 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <motion.div
                        className="h-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group cursor-pointer"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      >
                        <FiUsers className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
                      </motion.div>
                      <motion.div
                        className="h-24 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center group cursor-pointer"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      >
                        <FiBarChart2 className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
                      </motion.div>
                    </div>

                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        ref={statsRef}
        className="py-16 bg-white"
        initial={{ opacity: 0 }}
        animate={isStatsInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Labs Served", value: "500+", icon: FiGlobe },
              { label: "Samples Processed", value: "2M+", icon: FiCamera },
              { label: "Reports Generated", value: "5M+", icon: FiFileText },
              { label: "Happy Users", value: "10K+", icon: FiUsers },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        ref={featuresRef}
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={isFeaturesInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            >
              Powerful Features for Modern Labs
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              Everything you need to run a successful pathology lab, from
              patient management to advanced analytics.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your lab. All plans include our core
              features with no hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card
                  className={`h-full ${
                    plan.popular
                      ? "ring-2 ring-purple-500 shadow-2xl scale-105"
                      : "hover:shadow-xl"
                  } transition-all duration-300 border-0`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-600 ml-1">
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      className={`w-full bg-gradient-to-r ${plan.color} text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.popular ? "Start Free Trial" : "Get Started"}
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about PathoSaaS
            </p>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white border-0 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <blockquote className="text-2xl text-gray-700 mb-8 leading-relaxed">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>

                    <div className="flex items-center justify-center space-x-4">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${testimonials[currentTestimonial].color} rounded-full flex items-center justify-center text-white font-bold text-xl`}
                      >
                        {testimonials[currentTestimonial].avatar}
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-semibold text-lg">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-gray-600">
                          {testimonials[currentTestimonial].role}
                        </div>
                        <div className="text-blue-600 text-sm font-medium">
                          {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Lab?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of labs worldwide who trust PathoSaaS for their daily
            operations. Start your free trial today and see the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule Demo
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiActivity className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">PathoSaaS</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering pathology labs with modern technology solutions for
                better patient care and operational efficiency.
              </p>
              <div className="flex space-x-4">
                {[FiMail, FiPhone, FiMapPin].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 PathoSaaS. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
