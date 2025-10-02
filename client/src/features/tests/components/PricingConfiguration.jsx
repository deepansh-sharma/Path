import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiPercent, FiTag, FiInfo, FiSettings } from "react-icons/fi";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Switch } from "../../../components/ui/Switch";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Badge } from "../../../components/ui/Badge";
import { Separator } from "../../../components/ui/Separator";

const PricingConfiguration = ({ pricing, onChange, errors = {} }) => {
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Tax rate options
  const taxRateOptions = [
    { value: 0, label: "0% (Tax Exempt)" },
    { value: 5, label: "5% GST" },
    { value: 12, label: "12% GST" },
    { value: 18, label: "18% GST" },
    { value: 28, label: "28% GST" }
  ];

  // Discount type options
  const discountTypeOptions = [
    { value: "percentage", label: "Percentage (%)" },
    { value: "fixed", label: "Fixed Amount (₹)" }
  ];

  // Insurance provider options
  const insuranceProviderOptions = [
    { value: "", label: "Not Applicable" },
    { value: "cghs", label: "CGHS" },
    { value: "esic", label: "ESIC" },
    { value: "echs", label: "ECHS" },
    { value: "private", label: "Private Insurance" },
    { value: "corporate", label: "Corporate" },
    { value: "other", label: "Other" }
  ];

  // Package category options
  const packageCategoryOptions = [
    { value: "basic", label: "Basic Health Package" },
    { value: "comprehensive", label: "Comprehensive Package" },
    { value: "executive", label: "Executive Package" },
    { value: "cardiac", label: "Cardiac Package" },
    { value: "diabetes", label: "Diabetes Package" },
    { value: "thyroid", label: "Thyroid Package" },
    { value: "liver", label: "Liver Function Package" },
    { value: "kidney", label: "Kidney Function Package" },
    { value: "women", label: "Women's Health Package" },
    { value: "men", label: "Men's Health Package" },
    { value: "senior", label: "Senior Citizen Package" },
    { value: "custom", label: "Custom Package" }
  ];

  // Calculate final price including tax and discounts
  useEffect(() => {
    let finalPrice = pricing.basePrice || 0;
    
    // Apply discount
    if (pricing.discountEligible && pricing.discountValue > 0) {
      if (pricing.discountType === "percentage") {
        finalPrice = finalPrice * (1 - pricing.discountValue / 100);
      } else {
        finalPrice = Math.max(0, finalPrice - pricing.discountValue);
      }
    }
    
    // Apply tax
    if (pricing.taxRate > 0) {
      finalPrice = finalPrice * (1 + pricing.taxRate / 100);
    }
    
    setCalculatedPrice(finalPrice);
  }, [pricing.basePrice, pricing.taxRate, pricing.discountEligible, pricing.discountType, pricing.discountValue]);

  const handlePricingChange = (field, value) => {
    onChange({ ...pricing, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basic Pricing */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiDollarSign className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Pricing</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={pricing.basePrice || ""}
              onChange={(e) => handlePricingChange("basePrice", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              error={errors.basePrice}
              leftIcon={FiDollarSign}
            />
            <p className="text-xs text-gray-500 mt-1">
              Base cost of the test before tax and discounts
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate
            </label>
            <Select
              value={pricing.taxRate || 0}
              onChange={(value) => handlePricingChange("taxRate", value)}
              options={taxRateOptions}
            />
            <p className="text-xs text-gray-500 mt-1">
              Applicable GST/tax rate
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price (₹)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={pricing.costPrice || ""}
              onChange={(e) => handlePricingChange("costPrice", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              leftIcon={FiDollarSign}
            />
            <p className="text-xs text-gray-500 mt-1">
              Internal cost for margin calculation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margin (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                value={pricing.costPrice && pricing.basePrice 
                  ? (((pricing.basePrice - pricing.costPrice) / pricing.costPrice) * 100).toFixed(2)
                  : ""
                }
                readOnly
                placeholder="0.00"
                leftIcon={FiPercent}
                className="bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Calculated profit margin
            </p>
          </div>
        </div>

        {/* Price Summary */}
        <div className="mt-6 p-4 bg-healthcare-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiSettings className="w-4 h-4 text-healthcare-600" />
              <span className="font-medium text-healthcare-900">Final Price Calculation</span>
            </div>
            <Badge variant="success" className="text-lg px-3 py-1">
              ₹{calculatedPrice.toFixed(2)}
            </Badge>
          </div>
          <div className="mt-3 space-y-1 text-sm text-healthcare-700">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>₹{(pricing.basePrice || 0).toFixed(2)}</span>
            </div>
            {pricing.discountEligible && pricing.discountValue > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({pricing.discountType === "percentage" ? "%" : "₹"}):</span>
                <span>
                  -{pricing.discountType === "percentage" 
                    ? `${pricing.discountValue}%` 
                    : `₹${pricing.discountValue}`
                  }
                </span>
              </div>
            )}
            {pricing.taxRate > 0 && (
              <div className="flex justify-between">
                <span>Tax ({pricing.taxRate}%):</span>
                <span>₹{((calculatedPrice / (1 + pricing.taxRate / 100)) * (pricing.taxRate / 100)).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Discount Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiTag className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Discount Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Discount Eligible
              </label>
              <p className="text-xs text-gray-500">
                Allow discounts to be applied to this test
              </p>
            </div>
            <Switch
              checked={pricing.discountEligible || false}
              onChange={(checked) => handlePricingChange("discountEligible", checked)}
            />
          </div>

          {pricing.discountEligible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <Select
                    value={pricing.discountType || "percentage"}
                    onChange={(value) => handlePricingChange("discountType", value)}
                    options={discountTypeOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Discount Value
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={pricing.discountType === "percentage" ? 100 : pricing.basePrice}
                    value={pricing.maxDiscountValue || ""}
                    onChange={(e) => handlePricingChange("maxDiscountValue", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    leftIcon={pricing.discountType === "percentage" ? FiPercent : FiDollarSign}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price After Discount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricing.minPriceAfterDiscount || ""}
                    onChange={(e) => handlePricingChange("minPriceAfterDiscount", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    leftIcon={FiDollarSign}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Applicable Discount Schemes
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: "senior_citizen", label: "Senior Citizen" },
                    { value: "student", label: "Student" },
                    { value: "employee", label: "Employee" },
                    { value: "bulk_booking", label: "Bulk Booking" },
                    { value: "repeat_customer", label: "Repeat Customer" },
                    { value: "corporate", label: "Corporate" }
                  ].map((scheme) => (
                    <div key={scheme.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={pricing.applicableSchemes?.includes(scheme.value) || false}
                        onChange={(checked) => {
                          const schemes = pricing.applicableSchemes || [];
                          const newSchemes = checked
                            ? [...schemes, scheme.value]
                            : schemes.filter(s => s !== scheme.value);
                          handlePricingChange("applicableSchemes", newSchemes);
                        }}
                      />
                      <label className="text-sm text-gray-700">{scheme.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Billing & Insurance */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiInfo className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Billing & Insurance Codes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Billing Code
            </label>
            <Input
              value={pricing.billingCode || ""}
              onChange={(e) => handlePricingChange("billingCode", e.target.value)}
              placeholder="e.g., LAB001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Internal reference code for billing
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPT Code
            </label>
            <Input
              value={pricing.cptCode || ""}
              onChange={(e) => handlePricingChange("cptCode", e.target.value)}
              placeholder="e.g., 85025"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current Procedural Terminology code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Code
            </label>
            <Input
              value={pricing.insuranceCode || ""}
              onChange={(e) => handlePricingChange("insuranceCode", e.target.value)}
              placeholder="e.g., INS001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Insurance provider specific code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <Select
              value={pricing.insuranceProvider || ""}
              onChange={(value) => handlePricingChange("insuranceProvider", value)}
              options={insuranceProviderOptions}
              placeholder="Select provider"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NABL Code
            </label>
            <Input
              value={pricing.nablCode || ""}
              onChange={(e) => handlePricingChange("nablCode", e.target.value)}
              placeholder="e.g., NABL001"
            />
            <p className="text-xs text-gray-500 mt-1">
              National Accreditation Board code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SAC Code
            </label>
            <Input
              value={pricing.sacCode || ""}
              onChange={(e) => handlePricingChange("sacCode", e.target.value)}
              placeholder="e.g., 998212"
            />
            <p className="text-xs text-gray-500 mt-1">
              Services Accounting Code for GST
            </p>
          </div>
        </div>
      </Card>

      {/* Package Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiTag className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Package Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Package Eligible
              </label>
              <p className="text-xs text-gray-500">
                Can be included in health packages
              </p>
            </div>
            <Switch
              checked={pricing.packageEligible || false}
              onChange={(checked) => handlePricingChange("packageEligible", checked)}
            />
          </div>

          {pricing.packageEligible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Price (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricing.packagePrice || ""}
                    onChange={(e) => handlePricingChange("packagePrice", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    leftIcon={FiDollarSign}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Special price when included in packages
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Discount (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={pricing.packageDiscount || ""}
                    onChange={(e) => handlePricingChange("packageDiscount", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    leftIcon={FiPercent}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Applicable Package Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {packageCategoryOptions.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={pricing.packageCategories?.includes(category.value) || false}
                        onChange={(checked) => {
                          const categories = pricing.packageCategories || [];
                          const newCategories = checked
                            ? [...categories, category.value]
                            : categories.filter(c => c !== category.value);
                          handlePricingChange("packageCategories", newCategories);
                        }}
                      />
                      <label className="text-sm text-gray-700">{category.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Additional Pricing Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Home Collection Charges
              </label>
              <p className="text-xs text-gray-500">
                Additional charges for sample collection at home
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={pricing.homeCollectionAvailable || false}
                onChange={(checked) => handlePricingChange("homeCollectionAvailable", checked)}
              />
              {pricing.homeCollectionAvailable && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.homeCollectionCharges || ""}
                  onChange={(e) => handlePricingChange("homeCollectionCharges", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-24"
                  leftIcon={FiDollarSign}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Urgent Processing Charges
              </label>
              <p className="text-xs text-gray-500">
                Additional charges for urgent/STAT processing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={pricing.urgentProcessingAvailable || false}
                onChange={(checked) => handlePricingChange("urgentProcessingAvailable", checked)}
              />
              {pricing.urgentProcessingAvailable && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.urgentProcessingCharges || ""}
                  onChange={(e) => handlePricingChange("urgentProcessingCharges", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-24"
                  leftIcon={FiDollarSign}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Report Delivery Charges
              </label>
              <p className="text-xs text-gray-500">
                Charges for physical report delivery
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={pricing.reportDeliveryAvailable || false}
                onChange={(checked) => handlePricingChange("reportDeliveryAvailable", checked)}
              />
              {pricing.reportDeliveryAvailable && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.reportDeliveryCharges || ""}
                  onChange={(e) => handlePricingChange("reportDeliveryCharges", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-24"
                  leftIcon={FiDollarSign}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PricingConfiguration;