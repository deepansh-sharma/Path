import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, FiPlus, FiX, FiSave, FiSearch, FiFilter,
  FiEdit3, FiTrash2, FiDollarSign,
  FiPercent, FiTag, FiInfo, FiCheck, FiAlertCircle
} from "react-icons/fi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Textarea } from "../../../components/ui/Textarea";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Switch } from "../../../components/ui/Switch";
import { Separator } from "../../../components/ui/Separator";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { testApiService } from "../../../api/test/testApi";
import { testPackageApiService } from "../../../api/test/testPackageApi";
import PricingCalculator from "./PricingCalculator";

const PackageBuilder = ({ 
  isOpen, 
  onClose, 
  packageData = null, 
  onSave, 
  availableTests = [] 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "Routine",
    tests: [],
    pricing: {
      packagePrice: 0,
      discountPercentage: 0,
      totalIndividualPrice: 0,
      discountAmount: 0
    },
    tags: [],
    isActive: true
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [calculatedPricing, setCalculatedPricing] = useState({});

  // Package categories
  const packageCategories = [
    "Routine", "Preventive", "Diagnostic", "Specialized", 
    "Emergency", "Wellness", "Cardiac", "Diabetes", "Thyroid"
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (packageData) {
      setFormData({
        ...packageData,
        tests: packageData.tests || [],
        pricing: packageData.pricing || {
          packagePrice: 0,
          discountPercentage: 0,
          totalIndividualPrice: 0,
          discountAmount: 0
        }
      });
    }
  }, [packageData]);

  // Filter available tests
  useEffect(() => {
    let filtered = availableTests.filter(test => 
      !formData.tests.some(packageTest => packageTest.testId === test._id)
    );

    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    setFilteredTests(filtered);
  }, [availableTests, formData.tests, searchTerm, selectedCategory]);

  // Handle pricing changes from PricingCalculator
  const handlePricingChange = useCallback((newPricing) => {
    setCalculatedPricing(newPricing);
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        ...newPricing
      }
    }));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addTestToPackage = (test) => {
    const newTest = {
      testId: test._id,
      name: test.name,
      code: test.code,
      category: test.category,
      basePrice: test.pricing?.basePrice || 0,
      isOptional: false,
      customPrice: null
    };

    setFormData(prev => ({
      ...prev,
      tests: [...prev.tests, newTest]
    }));
  };

  const removeTestFromPackage = (testId) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter(test => test.testId !== testId)
    }));
  };

  const toggleTestOptional = (testId) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.map(test =>
        test.testId === testId 
          ? { ...test, isOptional: !test.isOptional }
          : test
      )
    }));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.code.trim() && 
           formData.tests.length >= 2 &&
           formData.pricing.packagePrice > 0;
  };

  const handleSave = async () => {
    if (!isFormValid()) return;

    setLoading(true);
    try {
      const packagePayload = {
        ...formData,
        tests: formData.tests.map(test => ({
          testId: test.testId,
          isOptional: test.isOptional,
          customPrice: test.customPrice
        }))
      };

      let response;
      if (packageData?._id) {
        response = await testPackageApiService.updateTestPackage(packageData._id, packagePayload);
      } else {
        response = await testPackageApiService.createTestPackage(packagePayload);
      }

      if (response.success) {
        onSave?.(response.data);
        onClose();
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      setErrors({ submit: error.message || "Failed to save package" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {packageData ? 'Edit Package' : 'Create New Package'}
              </h2>
              <p className="text-sm text-gray-500">
                Build custom test packages with pricing and discounts
              </p>
            </div>
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="flex flex-col h-full overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="details" className="h-full flex flex-col">
            <TabsList className="px-6 pt-4">
              <TabsTrigger value="details">Package Details</TabsTrigger>
              <TabsTrigger value="tests">Tests Selection</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Calculator</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              {/* Package Details Tab */}
              <TabsContent value="details" className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    
                    <div className="space-y-4">
                      <Input
                        label="Package Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter package name"
                        required
                      />

                      <Input
                        label="Package Code"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                        placeholder="PKG-001"
                        required
                      />

                      <Select
                        label="Category"
                        value={formData.category}
                        onChange={(value) => handleInputChange('category', value)}
                        options={packageCategories.map(cat => ({ value: cat, label: cat }))}
                        required
                      />

                      <Textarea
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the package purpose and benefits"
                        rows={3}
                      />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-red-600"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Add tag and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addTag(e.target.value.trim());
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Package Active
                        </label>
                        <Switch
                          checked={formData.isActive}
                          onChange={(checked) => handleInputChange('isActive', checked)}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Tests Selection Tab */}
              <TabsContent value="tests" className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Tests */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Available Tests
                    </h3>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search tests..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          leftIcon={FiSearch}
                          className="flex-1"
                        />
                        <Select
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          options={[
                            { value: "", label: "All Categories" },
                            ...Array.from(new Set(availableTests.map(t => t.category)))
                              .map(cat => ({ value: cat, label: cat }))
                          ]}
                          className="w-40"
                        />
                      </div>

                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredTests.map((test) => (
                          <motion.div
                            key={test._id}
                            className="p-3 border border-gray-200 rounded-lg hover:border-healthcare-300 cursor-pointer transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addTestToPackage(test)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{test.name}</div>
                                <div className="text-sm text-gray-600">{test.code}</div>
                                <Badge variant="outline" size="sm">
                                  {test.category}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  ₹{test.pricing?.basePrice || 0}
                                </div>
                                <Button size="sm" variant="ghost">
                                  <FiPlus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Selected Tests */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Package Tests ({formData.tests.length})
                    </h3>

                    <div className="min-h-96 space-y-3">
                      {formData.tests.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                          <FiPackage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No tests selected</p>
                          <p className="text-sm">Click on tests from the left to add them</p>
                        </div>
                      ) : (
                        formData.tests.map((test) => (
                          <motion.div
                            key={test.testId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {test.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {test.code} • {test.category}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={test.isOptional}
                                  onChange={() => toggleTestOptional(test.testId)}
                                  label="Optional"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTestFromPackage(test.testId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Pricing & Calculator Tab */}
              <TabsContent value="pricing" className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Pricing Info */}
                  <div className="space-y-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Package Summary
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Tests</span>
                          <span className="font-medium">{formData.tests.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mandatory Tests</span>
                          <span className="font-medium">
                            {formData.tests.filter(t => !t.isOptional).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Optional Tests</span>
                          <span className="font-medium">
                            {formData.tests.filter(t => t.isOptional).length}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 my-4"></div>
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Package Price</span>
                          <span className="text-healthcare-600">
                            ₹{calculatedPricing.packagePrice?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Column - Pricing Calculator */}
                  <div>
                    <PricingCalculator
                      tests={formData.tests}
                      onPricingChange={handlePricingChange}
                      initialPricing={formData.pricing}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="p-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Package Preview
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Package Name</label>
                        <div className="text-lg font-semibold">{formData.name || "Untitled Package"}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Package Code</label>
                        <div className="text-lg font-semibold">{formData.code || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <div className="text-gray-900">{formData.description || "No description provided"}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Tests Included</label>
                      <div className="mt-2 space-y-2">
                        {formData.tests.map((test) => (
                          <div key={test.testId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{test.name}</span>
                              {test.isOptional && <Badge variant="outline" size="sm" className="ml-2">Optional</Badge>}
                            </div>
                            <span className="text-gray-600">₹{test.basePrice}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Package Price</span>
                        <span className="text-healthcare-600">
                          ₹{calculatedPricing.packagePrice?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            {formData.tests.length > 0 && (
              <div className="text-sm text-gray-600">
                {formData.tests.length} tests selected • 
                Package Price: ₹{calculatedPricing.packagePrice?.toFixed(2) || '0.00'}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !isFormValid()}
              leftIcon={loading ? null : FiSave}
              className="bg-healthcare-600 hover:bg-healthcare-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                packageData ? "Update Package" : "Create Package"
              )}
            </Button>
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageBuilder;