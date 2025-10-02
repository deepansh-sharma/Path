import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSave, FiX, FiPlus, FiTrash2, FiCopy, FiCheck, 
  FiAlertTriangle, FiInfo, FiSettings, FiLayers,
  FiDollarSign, FiClock, FiShield, FiUsers
} from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Textarea } from "../../../components/ui/Textarea";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Switch } from "../../../components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { Badge } from "../../../components/ui/Badge";
import { Separator } from "../../../components/ui/Separator";
import ParameterManager from "./ParameterManager";
import PricingConfiguration from "./PricingConfiguration";
import ComplianceSettings from "./ComplianceSettings";
import WorkflowConfiguration from "./WorkflowConfiguration";

const TestForm = ({ test, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    // Core Information
    name: "",
    code: "",
    shortCode: "",
    description: "",
    preparationInstructions: "",
    
    // Categorization
    department: "",
    category: "",
    
    // Specimen Information
    specimen: {
      type: "",
      volume: "",
      container: "",
      preservative: "",
      storageConditions: "",
      transportConditions: "",
      collectionInstructions: ""
    },
    
    // Parameters
    parameters: [],
    
    // Pricing
    pricing: {
      basePrice: 0,
      discountEligible: false,
      taxRate: 0,
      billingCode: "",
      insuranceCode: "",
      cptCode: "",
      packageEligible: false
    },
    
    // Turnaround Time
    turnaroundTime: {
      routine: 24,
      urgent: 4,
      critical: 2,
      unit: "hours"
    },
    
    // Workflow
    workflow: {
      processingType: "in-house",
      equipmentRequired: [],
      reagentsRequired: [],
      schedulingRestrictions: "",
      outsourcedLab: null
    },
    
    // Reporting
    reporting: {
      templateId: "",
      autoInterpretation: false,
      graphicalRepresentation: false,
      customComments: true,
      multiTemplate: false
    },
    
    // Compliance
    compliance: {
      loincCode: "",
      icdCode: "",
      nablMapping: "",
      regulatoryFlags: [],
      consentRequired: false,
      biohazardLevel: "low",
      notificationRequired: false
    },
    
    // Status & Lifecycle
    status: "draft",
    requiresApproval: true,
    
    // Access Control
    accessControl: {
      roles: [],
      permissions: []
    }
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with test data if editing
  useEffect(() => {
    if (test && isEditing) {
      setFormData({ ...formData, ...test });
    }
  }, [test, isEditing]);

  // Department options
  const departmentOptions = [
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

  // Category options
  const categoryOptions = [
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

  // Specimen type options
  const specimenTypeOptions = [
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

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Test name is required";
    if (!formData.code.trim()) newErrors.code = "Test code is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.specimen.type) newErrors.specimenType = "Specimen type is required";
    
    // Code format validation
    if (formData.code && !/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = "Test code should contain only uppercase letters, numbers, hyphens, and underscores";
    }
    
    // Price validation
    if (formData.pricing.basePrice < 0) {
      newErrors.basePrice = "Price cannot be negative";
    }
    
    // TAT validation
    if (formData.turnaroundTime.routine <= 0) {
      newErrors.routineTat = "Routine TAT must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate short code if not provided
      if (!formData.shortCode) {
        formData.shortCode = formData.code.substring(0, 6).toUpperCase();
      }
      
      await onSave(formData);
    } catch (error) {
      console.error("Error saving test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Test" : "Create New Test"}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditing ? "Update test information and configuration" : "Configure all aspects of the new test"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              leftIcon={FiX}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              leftIcon={FiSave}
            >
              {isEditing ? "Update Test" : "Create Test"}
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FiInfo className="w-4 h-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="parameters" className="flex items-center gap-2">
                <FiLayers className="w-4 h-4" />
                Parameters
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <FiDollarSign className="w-4 h-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-2">
                <FiSettings className="w-4 h-4" />
                Reporting
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <FiShield className="w-4 h-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center gap-2">
                <FiUsers className="w-4 h-4" />
                Access
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                Review
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* Basic Information Tab */}
              <TabsContent value="basic">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Core Test Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Test Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g., Complete Blood Count"
                          error={errors.name}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Test Code *
                        </label>
                        <Input
                          value={formData.code}
                          onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                          placeholder="e.g., CBC_001"
                          error={errors.code}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Short Code
                        </label>
                        <Input
                          value={formData.shortCode}
                          onChange={(e) => handleInputChange("shortCode", e.target.value.toUpperCase())}
                          placeholder="e.g., CBC"
                          maxLength={6}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department *
                        </label>
                        <Select
                          value={formData.department}
                          onChange={(value) => handleInputChange("department", value)}
                          options={departmentOptions}
                          placeholder="Select department"
                          error={errors.department}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <Select
                          value={formData.category}
                          onChange={(value) => handleInputChange("category", value)}
                          options={categoryOptions}
                          placeholder="Select category"
                          error={errors.category}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description / Purpose
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Brief explanation of what this test measures and why it's performed"
                        rows={3}
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preparation Instructions
                      </label>
                      <Textarea
                        value={formData.preparationInstructions}
                        onChange={(e) => handleInputChange("preparationInstructions", e.target.value)}
                        placeholder="e.g., Fasting required for 12 hours, avoid alcohol 24 hours before test"
                        rows={3}
                      />
                    </div>
                  </Card>

                  {/* Specimen Information */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Specimen Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specimen Type *
                        </label>
                        <Select
                          value={formData.specimen.type}
                          onChange={(value) => handleInputChange("type", value, "specimen")}
                          options={specimenTypeOptions}
                          placeholder="Select specimen type"
                          error={errors.specimenType}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Volume Required
                        </label>
                        <Input
                          value={formData.specimen.volume}
                          onChange={(e) => handleInputChange("volume", e.target.value, "specimen")}
                          placeholder="e.g., 5 mL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Container Type
                        </label>
                        <Input
                          value={formData.specimen.container}
                          onChange={(e) => handleInputChange("container", e.target.value, "specimen")}
                          placeholder="e.g., EDTA tube, Plain tube"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preservative
                        </label>
                        <Input
                          value={formData.specimen.preservative}
                          onChange={(e) => handleInputChange("preservative", e.target.value, "specimen")}
                          placeholder="e.g., EDTA, Heparin, None"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Storage Conditions
                        </label>
                        <Input
                          value={formData.specimen.storageConditions}
                          onChange={(e) => handleInputChange("storageConditions", e.target.value, "specimen")}
                          placeholder="e.g., 2-8°C, Room temperature"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transport Conditions
                        </label>
                        <Input
                          value={formData.specimen.transportConditions}
                          onChange={(e) => handleInputChange("transportConditions", e.target.value, "specimen")}
                          placeholder="e.g., Refrigerated, Ambient"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection Instructions
                      </label>
                      <Textarea
                        value={formData.specimen.collectionInstructions}
                        onChange={(e) => handleInputChange("collectionInstructions", e.target.value, "specimen")}
                        placeholder="Special instructions for specimen collection"
                        rows={2}
                      />
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Parameters Tab */}
              <TabsContent value="parameters">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <ParameterManager
                    parameters={formData.parameters}
                    onChange={(parameters) => handleInputChange("parameters", parameters)}
                  />
                </motion.div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <PricingConfiguration
                    pricing={formData.pricing}
                    onChange={(pricing) => handleInputChange("pricing", pricing)}
                    errors={errors}
                  />
                </motion.div>
              </TabsContent>

              {/* Workflow Tab */}
              <TabsContent value="workflow">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <WorkflowConfiguration
                    workflow={formData.workflow}
                    turnaroundTime={formData.turnaroundTime}
                    onWorkflowChange={(workflow) => handleInputChange("workflow", workflow)}
                    onTatChange={(tat) => handleInputChange("turnaroundTime", tat)}
                    errors={errors}
                  />
                </motion.div>
              </TabsContent>

              {/* Reporting Tab */}
              <TabsContent value="reporting">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Reporting Configuration</h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Report Template
                          </label>
                          <Select
                            value={formData.reporting.templateId}
                            onChange={(value) => handleInputChange("templateId", value, "reporting")}
                            options={[
                              { value: "", label: "Default Template" },
                              { value: "hematology_standard", label: "Hematology Standard" },
                              { value: "biochemistry_standard", label: "Biochemistry Standard" },
                              { value: "custom_template", label: "Custom Template" }
                            ]}
                            placeholder="Select template"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Auto-Interpretation
                            </label>
                            <p className="text-xs text-gray-500">
                              Automatically flag abnormal results
                            </p>
                          </div>
                          <Switch
                            checked={formData.reporting.autoInterpretation}
                            onChange={(checked) => handleInputChange("autoInterpretation", checked, "reporting")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Graphical Representation
                            </label>
                            <p className="text-xs text-gray-500">
                              Include charts and graphs in reports
                            </p>
                          </div>
                          <Switch
                            checked={formData.reporting.graphicalRepresentation}
                            onChange={(checked) => handleInputChange("graphicalRepresentation", checked, "reporting")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Custom Comments Section
                            </label>
                            <p className="text-xs text-gray-500">
                              Allow doctors to add custom notes
                            </p>
                          </div>
                          <Switch
                            checked={formData.reporting.customComments}
                            onChange={(checked) => handleInputChange("customComments", checked, "reporting")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Multi-Template Support
                            </label>
                            <p className="text-xs text-gray-500">
                              Support different layouts for packages
                            </p>
                          </div>
                          <Switch
                            checked={formData.reporting.multiTemplate}
                            onChange={(checked) => handleInputChange("multiTemplate", checked, "reporting")}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Compliance Tab */}
              <TabsContent value="compliance">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <ComplianceSettings
                    compliance={formData.compliance}
                    onChange={(compliance) => handleInputChange("compliance", compliance)}
                  />
                </motion.div>
              </TabsContent>

              {/* Access Control Tab */}
              <TabsContent value="access">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Access Control & Permissions</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Role-Based Access
                        </label>
                        <div className="space-y-3">
                          {[
                            { value: "lab_admin", label: "Lab Admin", description: "Full access to create, edit, and delete" },
                            { value: "technician", label: "Technician", description: "View and update test results" },
                            { value: "finance", label: "Finance", description: "View pricing and billing details only" },
                            { value: "receptionist", label: "Receptionist", description: "View basic test information" }
                          ].map((role) => (
                            <div key={role.value} className="flex items-start space-x-3">
                              <Checkbox
                                checked={formData.accessControl.roles.includes(role.value)}
                                onChange={(checked) => {
                                  const newRoles = checked
                                    ? [...formData.accessControl.roles, role.value]
                                    : formData.accessControl.roles.filter(r => r !== role.value);
                                  handleInputChange("roles", newRoles, "accessControl");
                                }}
                              />
                              <div>
                                <label className="text-sm font-medium text-gray-700">
                                  {role.label}
                                </label>
                                <p className="text-xs text-gray-500">{role.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 my-4"></div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Specific Permissions
                        </label>
                        <div className="space-y-3">
                          {[
                            { value: "view-test", label: "View Test Details" },
                            { value: "edit-test", label: "Edit Test Information" },
                            { value: "delete-test", label: "Delete Test" },
                            { value: "clone-test", label: "Clone Test" },
                            { value: "manage-parameters", label: "Manage Parameters" },
                            { value: "update-pricing", label: "Update Pricing" },
                            { value: "approve-test", label: "Approve Test Changes" }
                          ].map((permission) => (
                            <div key={permission.value} className="flex items-center space-x-3">
                              <Checkbox
                                checked={formData.accessControl.permissions.includes(permission.value)}
                                onChange={(checked) => {
                                  const newPermissions = checked
                                    ? [...formData.accessControl.permissions, permission.value]
                                    : formData.accessControl.permissions.filter(p => p !== permission.value);
                                  handleInputChange("permissions", newPermissions, "accessControl");
                                }}
                              />
                              <label className="text-sm font-medium text-gray-700">
                                {permission.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 my-4"></div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Requires Approval
                            </label>
                            <p className="text-xs text-gray-500">
                              Test changes need senior pathologist approval
                            </p>
                          </div>
                          <Switch
                            checked={formData.requiresApproval}
                            onChange={(checked) => handleInputChange("requiresApproval", checked)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <Select
                            value={formData.status}
                            onChange={(value) => handleInputChange("status", value)}
                            options={[
                              { value: "draft", label: "Draft" },
                              { value: "pending_approval", label: "Pending Approval" },
                              { value: "active", label: "Active" },
                              { value: "inactive", label: "Inactive" },
                              { value: "deprecated", label: "Deprecated" }
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Review Tab */}
              <TabsContent value="review">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Review & Summary</h3>
                    
                    <div className="space-y-6">
                      {/* Basic Information Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Test Name:</span>
                            <span className="text-sm font-medium">{formData.name || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Code:</span>
                            <span className="text-sm font-medium">{formData.code || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Department:</span>
                            <span className="text-sm font-medium">{formData.department || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Category:</span>
                            <span className="text-sm font-medium">{formData.category || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Specimen Type:</span>
                            <span className="text-sm font-medium">{formData.specimen.type || "Not specified"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Parameters Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Parameters:</span>
                            <span className="text-sm font-medium">{formData.parameters.length}</span>
                          </div>
                          {formData.parameters.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {formData.parameters.slice(0, 5).map((param, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {param.name}
                                  </Badge>
                                ))}
                                {formData.parameters.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{formData.parameters.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Base Price:</span>
                            <span className="text-sm font-medium">₹{formData.pricing.basePrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tax Rate:</span>
                            <span className="text-sm font-medium">{formData.pricing.taxRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Discount Eligible:</span>
                            <span className="text-sm font-medium">
                              {formData.pricing.discountEligible ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Turnaround Time Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Turnaround Time</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Routine:</span>
                            <span className="text-sm font-medium">
                              {formData.turnaroundTime.routine} {formData.turnaroundTime.unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Urgent:</span>
                            <span className="text-sm font-medium">
                              {formData.turnaroundTime.urgent} {formData.turnaroundTime.unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Critical:</span>
                            <span className="text-sm font-medium">
                              {formData.turnaroundTime.critical} {formData.turnaroundTime.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Status & Access</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <Badge variant={formData.status === "active" ? "success" : "secondary"}>
                              {formData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Requires Approval:</span>
                            <span className="text-sm font-medium">
                              {formData.requiresApproval ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Authorized Roles:</span>
                            <span className="text-sm font-medium">
                              {formData.accessControl.roles.length || "None specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Validation Warnings */}
                      {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FiAlertTriangle className="w-4 h-4 text-red-600" />
                            <h4 className="font-medium text-red-800">Please fix the following issues:</h4>
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            {Object.entries(errors).map(([field, error]) => (
                              <li key={field} className="text-sm text-red-700">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </form>
      </Card>
    </div>
  );
};

export default TestForm;