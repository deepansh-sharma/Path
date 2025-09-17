import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiFlask,
  FiBarChart3,
  FiFileText,
  FiCreditCard,
  FiBell,
  FiScan,
} from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  // Features data
  const features = [
    {
      icon: FiUser,
      title: 'Patient Management',
      description: 'Comprehensive patient records, history tracking, and seamless appointment scheduling.',
      color: 'blue',
    },
    {
      icon: FiUsers,
      title: 'Staff Management',
      description: 'Role-based access control for technicians, receptionists, and finance teams.',
      color: 'green',
    },
    {
      icon: FiScan,
      title: 'Barcode Sample Tracking',
      description: 'Auto-generate barcodes and track samples from collection to reporting.',
      color: 'purple',
    },
    {
      icon: FiFileText,
      title: 'Report Management',
      description: 'Customizable templates with digital signatures and multi-channel sharing.',
      color: 'orange',
    },
    {
      icon: FiCreditCard,
      title: 'Invoice & Billing',
      description: 'Automated invoice generation with customizable branding and payment tracking.',
      color: 'red',
    },
    {
      icon: FiBarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights, revenue tracking, and comprehensive business analytics.',
      color: 'indigo',
    },
    {
      icon: FiBell,
      title: 'Notifications',
      description: 'Real-time alerts via SMS, email, and WhatsApp for reports and reminders.',
      color: 'yellow',
    },
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: 'Basic',
      price: '₹999',
      period: '/month',
      description: 'Perfect for small labs getting started',
      features: [
        '1 Lab Location',
        'Up to 5 Staff Members',
        'Basic Report Templates',
        'Email Notifications',
        'Patient Management',
        'Basic Analytics',
        'Email Support',
      ],
      popular: false,
      color: 'blue',
    },
    {
      name: 'Standard',
      price: '₹2,999',
      period: '/month',
      description: 'Ideal for growing labs with multiple locations',
      features: [
        'Up to 5 Lab Locations',
        'Unlimited Staff Members',
        'Advanced Report Templates',
        'SMS & WhatsApp Notifications',
        'Barcode Sample Tracking',
        'Advanced Analytics',
        'Priority Support',
        'Custom Branding',
      ],
      popular: true,
      color: 'green',
    },
    {
      name: 'Premium',
      price: '₹6,999',
      period: '/month',
      description: 'Complete solution for enterprise labs',
      features: [
        'Unlimited Lab Locations',
        'Unlimited Staff Members',
        'Custom Report Templates',
        'Multi-channel Notifications',
        'Advanced Sample Tracking',
        'Enterprise Analytics',
        '24/7 Priority Support',
        'API Integrations',
        'White-label Solution',
      ],
      popular: false,
      color: 'purple',
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Dr. Rajesh Mehta',
      role: 'Lab Director',
      company: 'MediCore Diagnostics',
      content: 'PathoSaaS reduced our sample errors by 90% with barcode tracking! The automated workflow has transformed our lab operations.',
      rating: 5,
      image: '/api/placeholder/64/64',
    },
    {
      name: 'Priya Sharma',
      role: 'Operations Manager',
      company: 'HealthPlus Labs',
      content: 'Automated invoices & reports save us 3 hours daily. The dashboard analytics help us make better business decisions.',
      rating: 5,
      image: '/api/placeholder/64/64',
    },
    {
      name: 'Dr. Amit Kumar',
      role: 'Chief Pathologist',
      company: 'Advanced Diagnostics',
      content: 'Patients love receiving digital reports on WhatsApp. The professional templates have enhanced our brand image significantly.',
      rating: 5,
      image: '/api/placeholder/64/64',
    },
  ];

  // Blog posts
  const blogPosts = [
    {
      title: '5 Ways to Improve Pathology Lab Efficiency',
      excerpt: 'Discover proven strategies to streamline your lab operations and boost productivity.',
      date: 'Dec 15, 2024',
      readTime: '5 min read',
      category: 'Operations',
      image: '/api/placeholder/400/200',
    },
    {
      title: 'Why Digital Reports are the Future of Diagnostics',
      excerpt: 'Learn how digital reporting is revolutionizing patient experience and lab efficiency.',
      date: 'Dec 12, 2024',
      readTime: '7 min read',
      category: 'Technology',
      image: '/api/placeholder/400/200',
    },
    {
      title: 'How Automation Helps Labs Boost Revenue',
      excerpt: 'Explore the financial benefits of implementing automated lab management systems.',
      date: 'Dec 10, 2024',
      readTime: '6 min read',
      category: 'Business',
      image: '/api/placeholder/400/200',
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Handle newsletter signup
      console.log('Newsletter signup:', email);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-healthcare-500 rounded-lg flex items-center justify-center">
                    <FiFlask className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">PathoSaaS</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-healthcare-600 transition-colors">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-healthcare-600 transition-colors">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-healthcare-600 transition-colors">Testimonials</a>
                <a href="#blog" className="text-gray-600 hover:text-healthcare-600 transition-colors">Blog</a>
                <a href="#contact" className="text-gray-600 hover:text-healthcare-600 transition-colors">Contact</a>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm">
                Start Free Trial
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-healthcare-600">Features</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-healthcare-600">Pricing</a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-healthcare-600">Testimonials</a>
                <a href="#blog" className="block px-3 py-2 text-gray-600 hover:text-healthcare-600">Blog</a>
                <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-healthcare-600">Contact</a>
                <div className="px-3 py-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                  <Button size="sm" className="w-full">Start Free Trial</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-healthcare-50 to-healthcare-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                All-in-One Pathology Lab Management Software
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Manage patients, staff, samples, invoices, and reports in one powerful SaaS platform. 
                Boost efficiency, reduce errors, and deliver a seamless patient experience.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                <Button size="lg" className="flex items-center space-x-2">
                  <span>Start Free Trial</span>
                  <FiArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <FiPlay className="w-5 h-5" />
                  <span>Request Demo</span>
                </Button>
              </div>
              <div className="flex items-center space-x-6 mt-8">
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">No credit card required</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Lab Dashboard</h3>
                    <Badge variant="success">Live</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">1,247</div>
                      <div className="text-sm text-gray-600">Patients</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">89</div>
                      <div className="text-sm text-gray-600">Reports Today</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">₹2.4L</div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">15</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Lab Smarter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive features designed specifically for pathology labs to streamline operations and improve patient care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Just 3 Steps
            </h2>
            <p className="text-xl text-gray-600">
              Simple setup process to get your lab running on PathoSaaS
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign Up',
                description: 'Create your lab account and choose your plan. Setup takes less than 5 minutes.',
                icon: FiUser,
              },
              {
                step: '02',
                title: 'Onboard Staff & Patients',
                description: 'Add your team members and import existing patient data with our migration tools.',
                icon: FiUsers,
              },
              {
                step: '03',
                title: 'Track, Report & Bill',
                description: 'Start managing samples, generating reports, and processing invoices seamlessly.',
                icon: FiTrendingUp,
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-healthcare-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-healthcare-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button size="lg" className="flex items-center space-x-2 mx-auto">
              <span>Start Managing Your Lab Today</span>
              <FiArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Flexible pricing options to fit labs of all sizes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="success" className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'ring-2 ring-healthcare-500 shadow-lg' : ''}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <FiCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by pathology labs across the country
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="text-center">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-xl text-gray-700 mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                      <img
                        src={testimonials[currentTestimonial].image}
                        alt={testimonials[currentTestimonial].name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-healthcare-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Insights
            </h2>
            <p className="text-xl text-gray-600">
              Stay updated with the latest trends in pathology lab management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-healthcare-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated with PathoSaaS
            </h2>
            <p className="text-xl text-healthcare-100 mb-8">
              Get the latest updates, tips, and insights delivered to your inbox
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex space-x-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white"
                required
              />
              <Button type="submit" variant="secondary">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-healthcare-500 rounded-lg flex items-center justify-center">
                  <FiFlask className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">PathoSaaS</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering pathology labs with modern, efficient, and reliable management solutions.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FiMail className="w-4 h-4 text-healthcare-400" />
                  <span className="text-gray-400">support@pathosaas.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="w-4 h-4 text-healthcare-400" />
                  <span className="text-gray-400">+91 98765 43210</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 PathoSaaS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;