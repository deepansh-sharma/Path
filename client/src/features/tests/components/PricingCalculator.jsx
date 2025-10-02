import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  FiDollarSign, FiPercent, FiSettings, FiInfo, 
  FiTrendingDown, FiTrendingUp, FiTarget,
  FiPlus, FiMinus, FiEdit3, FiCheck, FiX
} from "react-icons/fi";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Badge } from "../../../components/ui/Badge";
import Tooltip from "../../../components/ui/Tooltip";
import { Separator } from "../../../components/ui/Separator";
import { Switch } from "../../../components/ui/Switch";

const PricingCalculator = ({ 
  tests = [], 
  onPricingChange, 
  initialPricing = null,
  className = "" 
}) => {
  const [discountType, setDiscountType] = useState("percentage"); // percentage, fixed, tiered
  const [discountValue, setDiscountValue] = useState(0);
  const [customDiscountRules, setCustomDiscountRules] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [roundingRule, setRoundingRule] = useState("nearest"); // nearest, up, down, none
  const [minimumPrice, setMinimumPrice] = useState(0);
  const [maximumDiscount, setMaximumDiscount] = useState(100);

  // Tiered discount rules
  const [tieredRules, setTieredRules] = useState([
    { minTests: 3, maxTests: 5, discount: 10 },
    { minTests: 6, maxTests: 10, discount: 15 },
    { minTests: 11, maxTests: 999, discount: 20 }
  ]);

  // Calculate base pricing from tests
  const basePricing = useMemo(() => {
    const totalIndividualPrice = tests.reduce((sum, test) => {
      return sum + (test.price || 0);
    }, 0);

    const mandatoryPrice = tests
      .filter(test => !test.isOptional)
      .reduce((sum, test) => sum + (test.price || 0), 0);

    const optionalPrice = tests
      .filter(test => test.isOptional)
      .reduce((sum, test) => sum + (test.price || 0), 0);

    return {
      totalIndividualPrice,
      mandatoryPrice,
      optionalPrice,
      testCount: tests.length,
      mandatoryCount: tests.filter(test => !test.isOptional).length,
      optionalCount: tests.filter(test => test.isOptional).length
    };
  }, [tests]);

  // Calculate final pricing with discounts
  const finalPricing = useMemo(() => {
    let discountAmount = 0;
    let discountPercentage = 0;

    switch (discountType) {
      case "percentage":
        discountAmount = (basePricing.totalIndividualPrice * discountValue) / 100;
        discountPercentage = discountValue;
        break;

      case "fixed":
        discountAmount = Math.min(discountValue, basePricing.totalIndividualPrice);
        discountPercentage = basePricing.totalIndividualPrice > 0 
          ? (discountAmount / basePricing.totalIndividualPrice) * 100 
          : 0;
        break;

      case "tiered":
        const applicableRule = tieredRules.find(rule => 
          basePricing.testCount >= rule.minTests && basePricing.testCount <= rule.maxTests
        );
        if (applicableRule) {
          discountAmount = (basePricing.totalIndividualPrice * applicableRule.discount) / 100;
          discountPercentage = applicableRule.discount;
        }
        break;

      default:
        break;
    }

    // Apply maximum discount limit
    if (discountPercentage > maximumDiscount) {
      discountAmount = (basePricing.totalIndividualPrice * maximumDiscount) / 100;
      discountPercentage = maximumDiscount;
    }

    let packagePrice = basePricing.totalIndividualPrice - discountAmount;

    // Apply minimum price
    if (packagePrice < minimumPrice) {
      packagePrice = minimumPrice;
      discountAmount = basePricing.totalIndividualPrice - packagePrice;
      discountPercentage = basePricing.totalIndividualPrice > 0 
        ? (discountAmount / basePricing.totalIndividualPrice) * 100 
        : 0;
    }

    // Apply rounding rules
    switch (roundingRule) {
      case "up":
        packagePrice = Math.ceil(packagePrice);
        break;
      case "down":
        packagePrice = Math.floor(packagePrice);
        break;
      case "nearest":
        packagePrice = Math.round(packagePrice);
        break;
      default:
        // Keep exact value
        break;
    }

    // Recalculate discount after rounding
    const finalDiscountAmount = basePricing.totalIndividualPrice - packagePrice;
    const finalDiscountPercentage = basePricing.totalIndividualPrice > 0 
      ? (finalDiscountAmount / basePricing.totalIndividualPrice) * 100 
      : 0;

    return {
      ...basePricing,
      packagePrice,
      discountAmount: finalDiscountAmount,
      discountPercentage: finalDiscountPercentage,
      savings: finalDiscountAmount,
      profitMargin: packagePrice > 0 ? ((packagePrice - (basePricing.totalIndividualPrice * 0.7)) / packagePrice) * 100 : 0
    };
  }, [basePricing, discountType, discountValue, tieredRules, roundingRule, minimumPrice, maximumDiscount]);

  // Initialize with existing pricing
  useEffect(() => {
    if (initialPricing) {
      setDiscountType(initialPricing.discountType || "percentage");
      setDiscountValue(initialPricing.discountValue || 0);
      setMinimumPrice(initialPricing.minimumPrice || 0);
      setMaximumDiscount(initialPricing.maximumDiscount || 100);
      setRoundingRule(initialPricing.roundingRule || "nearest");
      if (initialPricing.tieredRules) {
        setTieredRules(initialPricing.tieredRules);
      }
    }
  }, [initialPricing]);

  // Notify parent of pricing changes
  useEffect(() => {
    if (onPricingChange) {
      onPricingChange({
        ...finalPricing,
        discountType,
        discountValue,
        tieredRules,
        roundingRule,
        minimumPrice,
        maximumDiscount
      });
    }
  }, [finalPricing, discountType, discountValue, tieredRules, roundingRule, minimumPrice, maximumDiscount, onPricingChange]);

  const addTieredRule = () => {
    const newRule = {
      minTests: tieredRules.length > 0 ? Math.max(...tieredRules.map(r => r.maxTests)) + 1 : 1,
      maxTests: tieredRules.length > 0 ? Math.max(...tieredRules.map(r => r.maxTests)) + 5 : 5,
      discount: 10
    };
    setTieredRules([...tieredRules, newRule]);
  };

  const updateTieredRule = (index, field, value) => {
    const updatedRules = tieredRules.map((rule, i) => 
      i === index ? { ...rule, [field]: parseInt(value) || 0 } : rule
    );
    setTieredRules(updatedRules);
  };

  const removeTieredRule = (index) => {
    setTieredRules(tieredRules.filter((_, i) => i !== index));
  };

  const getDiscountColor = (percentage) => {
    if (percentage >= 20) return "text-green-600";
    if (percentage >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getProfitMarginColor = (margin) => {
    if (margin >= 30) return "text-green-600";
    if (margin >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pricing Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiSettings className="text-healthcare-600" />
            Pricing Calculator
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            leftIcon={FiSettings}
          >
            Advanced
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              ₹{finalPricing.totalIndividualPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Individual Total</div>
            <div className="text-xs text-gray-500 mt-1">
              {basePricing.testCount} tests
            </div>
          </div>

          <div className="text-center p-4 bg-healthcare-50 rounded-lg">
            <div className="text-2xl font-bold text-healthcare-600">
              ₹{finalPricing.packagePrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Package Price</div>
            <div className="text-xs text-gray-500 mt-1">
              After discount
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className={`text-2xl font-bold ${getDiscountColor(finalPricing.discountPercentage)}`}>
              {finalPricing.discountPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Savings</div>
            <div className="text-xs text-gray-500 mt-1">
              ₹{finalPricing.savings.toFixed(2)} saved
            </div>
          </div>
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select
              label="Discount Type"
              value={discountType}
              onChange={setDiscountType}
              options={[
                { value: "percentage", label: "Percentage" },
                { value: "fixed", label: "Fixed Amount" },
                { value: "tiered", label: "Tiered (by test count)" }
              ]}
              className="flex-1"
            />

            {discountType !== "tiered" && (
              <Input
                label={discountType === "percentage" ? "Discount %" : "Discount Amount"}
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                min="0"
                max={discountType === "percentage" ? "100" : undefined}
                step={discountType === "percentage" ? "0.1" : "1"}
                className="flex-1"
                rightIcon={discountType === "percentage" ? FiPercent : FiDollarSign}
              />
            )}
          </div>

          {/* Tiered Rules */}
          {discountType === "tiered" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Tiered Discount Rules
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTieredRule}
                  leftIcon={FiPlus}
                >
                  Add Rule
                </Button>
              </div>

              <div className="space-y-2">
                {tieredRules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Input
                      type="number"
                      value={rule.minTests}
                      onChange={(e) => updateTieredRule(index, 'minTests', e.target.value)}
                      placeholder="Min tests"
                      className="w-24"
                      min="1"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="number"
                      value={rule.maxTests}
                      onChange={(e) => updateTieredRule(index, 'maxTests', e.target.value)}
                      placeholder="Max tests"
                      className="w-24"
                      min="1"
                    />
                    <span className="text-gray-500">tests:</span>
                    <Input
                      type="number"
                      value={rule.discount}
                      onChange={(e) => updateTieredRule(index, 'discount', e.target.value)}
                      placeholder="Discount %"
                      className="w-24"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-gray-500">%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTieredRule(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiMinus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Current applicable rule */}
              {(() => {
                const applicableRule = tieredRules.find(rule => 
                  basePricing.testCount >= rule.minTests && basePricing.testCount <= rule.maxTests
                );
                return applicableRule && (
                  <div className="p-3 bg-healthcare-50 rounded-lg border border-healthcare-200">
                    <div className="flex items-center gap-2 text-sm">
                      <FiTarget className="text-healthcare-600" />
                      <span className="font-medium text-healthcare-700">
                        Current rule: {applicableRule.discount}% discount for {basePricing.testCount} tests
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 pt-6 border-t border-gray-200 space-y-4"
          >
            <h4 className="font-medium text-gray-900">Advanced Pricing Options</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Package Price"
                type="number"
                value={minimumPrice}
                onChange={(e) => setMinimumPrice(parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                leftIcon={FiDollarSign}
              />

              <Input
                label="Maximum Discount %"
                type="number"
                value={maximumDiscount}
                onChange={(e) => setMaximumDiscount(parseFloat(e.target.value) || 100)}
                min="0"
                max="100"
                step="0.1"
                leftIcon={FiPercent}
              />
            </div>

            <Select
              label="Price Rounding"
              value={roundingRule}
              onChange={setRoundingRule}
              options={[
                { value: "none", label: "No rounding" },
                { value: "nearest", label: "Round to nearest" },
                { value: "up", label: "Round up" },
                { value: "down", label: "Round down" }
              ]}
            />
          </motion.div>
        )}
      </Card>

      {/* Pricing Breakdown */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Pricing Breakdown</h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Individual Tests Total</span>
            <span className="font-medium">₹{finalPricing.totalIndividualPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Discount ({finalPricing.discountPercentage.toFixed(1)}%)
            </span>
            <span className="font-medium text-green-600">
              -₹{finalPricing.discountAmount.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Package Price</span>
            <span className="text-healthcare-600">₹{finalPricing.packagePrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Customer Savings</span>
            <span className="font-medium text-green-600">
              ₹{finalPricing.savings.toFixed(2)} ({finalPricing.discountPercentage.toFixed(1)}%)
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Estimated Profit Margin</span>
            <span className={`font-medium ${getProfitMarginColor(finalPricing.profitMargin)}`}>
              {finalPricing.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Test Breakdown */}
      {tests.length > 0 && (
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Test Breakdown</h4>

          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{test.name}</span>
                  {test.isOptional && (
                    <Badge variant="outline" size="sm">Optional</Badge>
                  )}
                </div>
                <span className="font-medium">₹{(test.price || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Mandatory Tests: </span>
              <span className="font-medium">{basePricing.mandatoryCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Optional Tests: </span>
              <span className="font-medium">{basePricing.optionalCount}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Pricing Insights */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FiInfo className="text-healthcare-600" />
          Pricing Insights
        </h4>

        <div className="space-y-3 text-sm">
          {finalPricing.discountPercentage > 25 && (
            <div className="flex items-center gap-2 text-amber-600">
              <FiTrendingDown className="w-4 h-4" />
              <span>High discount may impact profitability</span>
            </div>
          )}

          {finalPricing.discountPercentage < 5 && basePricing.testCount > 3 && (
            <div className="flex items-center gap-2 text-blue-600">
              <FiTrendingUp className="w-4 h-4" />
              <span>Consider increasing discount for better customer value</span>
            </div>
          )}

          {finalPricing.profitMargin < 15 && (
            <div className="flex items-center gap-2 text-red-600">
              <FiTrendingDown className="w-4 h-4" />
              <span>Low profit margin - review pricing strategy</span>
            </div>
          )}

          {finalPricing.savings > 500 && (
            <div className="flex items-center gap-2 text-green-600">
              <FiTarget className="w-4 h-4" />
              <span>Excellent value proposition for customers</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PricingCalculator;