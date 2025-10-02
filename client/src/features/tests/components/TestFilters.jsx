import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { Checkbox } from "../../../components/ui/Checkbox";
import { DatePicker } from "../../../components/ui/DatePicker";
import { RangeSlider } from "../../../components/ui/RangeSlider";

const TestFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const departmentOptions = [
    { value: "", label: "All Departments" },
    { value: "hematology", label: "Hematology" },
    { value: "biochemistry", label: "Biochemistry" },
    { value: "serology", label: "Serology" },
    { value: "microbiology", label: "Microbiology" },
    { value: "immunology", label: "Immunology" },
    { value: "pathology", label: "Pathology" },
    { value: "cytology", label: "Cytology" },
    { value: "molecular biology", label: "Molecular Biology" },
    { value: "genetics", label: "Genetics" },
    { value: "toxicology", label: "Toxicology" },
    { value: "endocrinology", label: "Endocrinology" },
    { value: "cardiology", label: "Cardiology" },
    { value: "oncology", label: "Oncology" },
    { value: "infectious diseases", label: "Infectious Diseases" },
    { value: "other", label: "Other" }
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "single test", label: "Single Test" },
    { value: "package", label: "Package" },
    { value: "panel", label: "Panel" },
    { value: "outsourced test", label: "Outsourced Test" },
    { value: "profile", label: "Profile" },
    { value: "screening", label: "Screening" },
    { value: "diagnostic", label: "Diagnostic" },
    { value: "monitoring", label: "Monitoring" },
    { value: "emergency", label: "Emergency" }
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "deprecated", label: "Deprecated" }
  ];

  const specimenTypeOptions = [
    { value: "", label: "All Specimen Types" },
    { value: "blood", label: "Blood" },
    { value: "serum", label: "Serum" },
    { value: "plasma", label: "Plasma" },
    { value: "whole blood", label: "Whole Blood" },
    { value: "urine", label: "Urine" },
    { value: "stool", label: "Stool" },
    { value: "sputum", label: "Sputum" },
    { value: "swab", label: "Swab" },
    { value: "tissue", label: "Tissue" },
    { value: "csf", label: "CSF" },
    { value: "synovial", label: "Synovial" },
    { value: "saliva", label: "Saliva" },
    { value: "bone marrow", label: "Bone Marrow" },
    { value: "other", label: "Other" }
  ];

  const processingTypeOptions = [
    { value: "", label: "All Processing Types" },
    { value: "in-house", label: "In-house" },
    { value: "outsourced", label: "Outsourced" },
    { value: "hybrid", label: "Hybrid" }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (range) => {
    const newFilters = { 
      ...localFilters, 
      minPrice: range[0], 
      maxPrice: range[1] 
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTatRangeChange = (range) => {
    const newFilters = { 
      ...localFilters, 
      minTat: range[0], 
      maxTat: range[1] 
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const activeFilterCount = Object.keys(localFilters).filter(key => 
    localFilters[key] && localFilters[key] !== ""
  ).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-healthcare-100 text-healthcare-800 text-xs px-2 py-1 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          leftIcon={FiRefreshCw}
          disabled={activeFilterCount === 0}
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Basic Filters */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Basic Filters</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Select
              value={localFilters.department || ""}
              onChange={(value) => handleFilterChange("department", value)}
              options={departmentOptions}
              placeholder="Select department"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              value={localFilters.category || ""}
              onChange={(value) => handleFilterChange("category", value)}
              options={categoryOptions}
              placeholder="Select category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={localFilters.status || ""}
              onChange={(value) => handleFilterChange("status", value)}
              options={statusOptions}
              placeholder="Select status"
            />
          </div>
        </div>

        {/* Specimen & Processing */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Specimen & Processing</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specimen Type
            </label>
            <Select
              value={localFilters.specimenType || ""}
              onChange={(value) => handleFilterChange("specimenType", value)}
              options={specimenTypeOptions}
              placeholder="Select specimen type"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Type
            </label>
            <Select
              value={localFilters.processingType || ""}
              onChange={(value) => handleFilterChange("processingType", value)}
              options={processingTypeOptions}
              placeholder="Select processing type"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Special Requirements
            </label>
            <div className="space-y-2">
              <Checkbox
                checked={localFilters.fastingRequired || false}
                onChange={(checked) => handleFilterChange("fastingRequired", checked)}
                label="Fasting Required"
              />
              <Checkbox
                checked={localFilters.consentRequired || false}
                onChange={(checked) => handleFilterChange("consentRequired", checked)}
                label="Consent Required"
              />
              <Checkbox
                checked={localFilters.criticalValues || false}
                onChange={(checked) => handleFilterChange("criticalValues", checked)}
                label="Has Critical Values"
              />
            </div>
          </div>
        </div>

        {/* Price & Time Ranges */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Price & Time</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range (₹)
            </label>
            <RangeSlider
              min={0}
              max={10000}
              step={100}
              value={[localFilters.minPrice || 0, localFilters.maxPrice || 10000]}
              onChange={handlePriceRangeChange}
              formatLabel={(value) => `₹${value}`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹{localFilters.minPrice || 0}</span>
              <span>₹{localFilters.maxPrice || 10000}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Turnaround Time (hours)
            </label>
            <RangeSlider
              min={0}
              max={168} // 7 days
              step={1}
              value={[localFilters.minTat || 0, localFilters.maxTat || 168]}
              onChange={handleTatRangeChange}
              formatLabel={(value) => `${value}h`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{localFilters.minTat || 0}h</span>
              <span>{localFilters.maxTat || 168}h</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parameter Count
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.minParameters || ""}
                onChange={(e) => handleFilterChange("minParameters", e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.maxParameters || ""}
                onChange={(e) => handleFilterChange("maxParameters", e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Date & Advanced */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Date & Advanced</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created After
            </label>
            <DatePicker
              value={localFilters.createdAfter}
              onChange={(date) => handleFilterChange("createdAfter", date)}
              placeholder="Select date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Before
            </label>
            <DatePicker
              value={localFilters.createdBefore}
              onChange={(date) => handleFilterChange("createdBefore", date)}
              placeholder="Select date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
            <Input
              value={localFilters.createdBy || ""}
              onChange={(e) => handleFilterChange("createdBy", e.target.value)}
              placeholder="User name or ID"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Additional Options
            </label>
            <div className="space-y-2">
              <Checkbox
                checked={localFilters.isPopular || false}
                onChange={(checked) => handleFilterChange("isPopular", checked)}
                label="Popular Tests Only"
              />
              <Checkbox
                checked={localFilters.hasPackages || false}
                onChange={(checked) => handleFilterChange("hasPackages", checked)}
                label="Part of Packages"
              />
              <Checkbox
                checked={localFilters.hasDiscounts || false}
                onChange={(checked) => handleFilterChange("hasDiscounts", checked)}
                label="Has Discounts"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value || value === "") return null;
              
              let displayValue = value;
              if (key === "minPrice" || key === "maxPrice") {
                displayValue = `₹${value}`;
              } else if (key === "minTat" || key === "maxTat") {
                displayValue = `${value}h`;
              } else if (typeof value === "boolean") {
                displayValue = value ? "Yes" : "No";
              }

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 bg-healthcare-100 text-healthcare-800 px-2 py-1 rounded-full text-xs"
                >
                  <span>{key}: {displayValue}</span>
                  <button
                    onClick={() => handleFilterChange(key, "")}
                    className="hover:bg-healthcare-200 rounded-full p-0.5"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TestFilters;