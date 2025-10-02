import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FiClock, 
  FiSettings, 
  FiTruck, 
  FiCalendar, 
  FiUsers,
  FiMonitor,
  FiPackage,
  FiMapPin,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Switch } from "../../../components/ui/Switch";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Textarea } from "../../../components/ui/Textarea";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

const WorkflowConfiguration = ({ workflow, onChange, errors = {} }) => {
  const [selectedDays, setSelectedDays] = useState(workflow.availableDays || []);

  // Processing types
  const processingTypes = [
    { value: "inhouse", label: "In-house Processing" },
    { value: "outsourced", label: "Outsourced to Partner Lab" },
    { value: "hybrid", label: "Hybrid (Partial Outsourcing)" }
  ];

  // Equipment/Analyzer options
  const equipmentOptions = [
    { value: "hematology_analyzer", label: "Hematology Analyzer" },
    { value: "chemistry_analyzer", label: "Chemistry Analyzer" },
    { value: "immunoassay_analyzer", label: "Immunoassay Analyzer" },
    { value: "coagulation_analyzer", label: "Coagulation Analyzer" },
    { value: "urinalysis_analyzer", label: "Urinalysis Analyzer" },
    { value: "microscope", label: "Microscope" },
    { value: "centrifuge", label: "Centrifuge" },
    { value: "incubator", label: "Incubator" },
    { value: "pcr_machine", label: "PCR Machine" },
    { value: "elisa_reader", label: "ELISA Reader" },
    { value: "flow_cytometer", label: "Flow Cytometer" },
    { value: "manual", label: "Manual Processing" }
  ];

  // Priority levels
  const priorityLevels = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "stat", label: "STAT (Immediate)" },
    { value: "critical", label: "Critical" }
  ];

  // Days of the week
  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
  ];

  // Sample collection methods
  const collectionMethods = [
    { value: "walk_in", label: "Walk-in Collection" },
    { value: "home_collection", label: "Home Collection" },
    { value: "both", label: "Both Methods Available" }
  ];

  // Quality control levels
  const qcLevels = [
    { value: "basic", label: "Basic QC" },
    { value: "standard", label: "Standard QC" },
    { value: "enhanced", label: "Enhanced QC" },
    { value: "research", label: "Research Grade QC" }
  ];

  const handleWorkflowChange = (field, value) => {
    onChange({ ...workflow, [field]: value });
  };

  const handleArrayFieldChange = (field, value, checked) => {
    const currentArray = workflow[field] || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    handleWorkflowChange(field, newArray);
  };

  const handleDayToggle = (day, checked) => {
    const newDays = checked
      ? [...selectedDays, day]
      : selectedDays.filter(d => d !== day);
    setSelectedDays(newDays);
    handleWorkflowChange("availableDays", newDays);
  };

  const calculateTotalTAT = () => {
    const collection = workflow.collectionTime || 0;
    const processing = workflow.processingTime || 0;
    const reporting = workflow.reportingTime || 0;
    const delivery = workflow.deliveryTime || 0;
    return collection + processing + reporting + delivery;
  };

  return (
    <div className="space-y-6">
      {/* Turnaround Time Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiClock className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Turnaround Time (TAT)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Time (hours)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={workflow.collectionTime || ""}
              onChange={(e) => handleWorkflowChange("collectionTime", parseFloat(e.target.value) || 0)}
              placeholder="0"
              error={errors.collectionTime}
            />
            <p className="text-xs text-gray-500 mt-1">
              Time to collect sample
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Time (hours)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={workflow.processingTime || ""}
              onChange={(e) => handleWorkflowChange("processingTime", parseFloat(e.target.value) || 0)}
              placeholder="0"
              error={errors.processingTime}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lab processing time
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reporting Time (hours)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={workflow.reportingTime || ""}
              onChange={(e) => handleWorkflowChange("reportingTime", parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Report generation time
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Time (hours)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={workflow.deliveryTime || ""}
              onChange={(e) => handleWorkflowChange("deliveryTime", parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Report delivery time
            </p>
          </div>
        </div>

        {/* TAT Summary */}
        <div className="mt-6 p-4 bg-healthcare-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-healthcare-600" />
              <span className="font-medium text-healthcare-900">Total TAT</span>
            </div>
            <Badge variant="info" className="text-lg px-3 py-1">
              {calculateTotalTAT()} hours
            </Badge>
          </div>
          <div className="mt-2 text-sm text-healthcare-700">
            Approximately {Math.ceil(calculateTotalTAT() / 24)} business day(s)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              STAT TAT (hours)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={workflow.statTAT || ""}
              onChange={(e) => handleWorkflowChange("statTAT", parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Emergency/urgent processing time
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level
            </label>
            <Select
              value={workflow.priorityLevel || "routine"}
              onChange={(value) => handleWorkflowChange("priorityLevel", value)}
              options={priorityLevels}
            />
          </div>
        </div>
      </Card>

      {/* Processing Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiSettings className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Processing Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Type
            </label>
            <Select
              value={workflow.processingType || "inhouse"}
              onChange={(value) => handleWorkflowChange("processingType", value)}
              options={processingTypes}
              error={errors.processingType}
            />
          </div>

          {workflow.processingType === "outsourced" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Lab Name
                  </label>
                  <Input
                    value={workflow.partnerLabName || ""}
                    onChange={(e) => handleWorkflowChange("partnerLabName", e.target.value)}
                    placeholder="Enter partner lab name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Lab Code
                  </label>
                  <Input
                    value={workflow.partnerLabCode || ""}
                    onChange={(e) => handleWorkflowChange("partnerLabCode", e.target.value)}
                    placeholder="e.g., PL001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outsourcing Cost (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={workflow.outsourcingCost || ""}
                    onChange={(e) => handleWorkflowChange("outsourcingCost", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner TAT (hours)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={workflow.partnerTAT || ""}
                    onChange={(e) => handleWorkflowChange("partnerTAT", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Lab Contact
                </label>
                <Textarea
                  value={workflow.partnerLabContact || ""}
                  onChange={(e) => handleWorkflowChange("partnerLabContact", e.target.value)}
                  placeholder="Contact details, address, phone, email..."
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Required Equipment/Analyzers
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {equipmentOptions.map((equipment) => (
                <div key={equipment.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={workflow.requiredEquipment?.includes(equipment.value) || false}
                    onChange={(checked) => handleArrayFieldChange("requiredEquipment", equipment.value, checked)}
                  />
                  <label className="text-sm text-gray-700">{equipment.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality Control Level
            </label>
            <Select
              value={workflow.qcLevel || "standard"}
              onChange={(value) => handleWorkflowChange("qcLevel", value)}
              options={qcLevels}
            />
          </div>
        </div>
      </Card>

      {/* Scheduling & Availability */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Scheduling & Availability</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Days
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedDays.includes(day.value)}
                    onChange={(checked) => handleDayToggle(day.value, checked)}
                  />
                  <label className="text-sm text-gray-700">{day.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours (Start)
              </label>
              <Input
                type="time"
                value={workflow.operatingHoursStart || ""}
                onChange={(e) => handleWorkflowChange("operatingHoursStart", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours (End)
              </label>
              <Input
                type="time"
                value={workflow.operatingHoursEnd || ""}
                onChange={(e) => handleWorkflowChange("operatingHoursEnd", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size (samples)
              </label>
              <Input
                type="number"
                min="1"
                value={workflow.batchSize || ""}
                onChange={(e) => handleWorkflowChange("batchSize", parseInt(e.target.value) || 1)}
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of samples processed together
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Frequency
              </label>
              <Select
                value={workflow.processingFrequency || "continuous"}
                onChange={(value) => handleWorkflowChange("processingFrequency", value)}
                options={[
                  { value: "continuous", label: "Continuous" },
                  { value: "hourly", label: "Every Hour" },
                  { value: "twice_daily", label: "Twice Daily" },
                  { value: "daily", label: "Once Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "on_demand", label: "On Demand" }
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                24/7 Availability
              </label>
              <p className="text-xs text-gray-500">
                Test available round the clock
              </p>
            </div>
            <Switch
              checked={workflow.available24x7 || false}
              onChange={(checked) => handleWorkflowChange("available24x7", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Holiday Processing
              </label>
              <p className="text-xs text-gray-500">
                Available on holidays
              </p>
            </div>
            <Switch
              checked={workflow.holidayProcessing || false}
              onChange={(checked) => handleWorkflowChange("holidayProcessing", checked)}
            />
          </div>
        </div>
      </Card>

      {/* Sample Collection & Handling */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiTruck className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sample Collection & Handling</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Method
            </label>
            <Select
              value={workflow.collectionMethod || "both"}
              onChange={(value) => handleWorkflowChange("collectionMethod", value)}
              options={collectionMethods}
            />
          </div>

          {(workflow.collectionMethod === "home_collection" || workflow.collectionMethod === "both") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Home Collection Charges (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={workflow.homeCollectionCharges || ""}
                    onChange={(e) => handleWorkflowChange("homeCollectionCharges", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Radius (km)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={workflow.collectionRadius || ""}
                    onChange={(e) => handleWorkflowChange("collectionRadius", parseInt(e.target.value) || 10)}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Time Slots
                  </label>
                  <Select
                    value={workflow.collectionTimeSlots || "flexible"}
                    onChange={(value) => handleWorkflowChange("collectionTimeSlots", value)}
                    options={[
                      { value: "flexible", label: "Flexible Timing" },
                      { value: "morning", label: "Morning Only (6 AM - 12 PM)" },
                      { value: "afternoon", label: "Afternoon Only (12 PM - 6 PM)" },
                      { value: "evening", label: "Evening Only (6 PM - 10 PM)" },
                      { value: "scheduled", label: "Pre-scheduled Slots" }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Value (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={workflow.minOrderValueForCollection || ""}
                    onChange={(e) => handleWorkflowChange("minOrderValueForCollection", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum order value for free home collection
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Stability (hours)
              </label>
              <Input
                type="number"
                min="1"
                value={workflow.sampleStability || ""}
                onChange={(e) => handleWorkflowChange("sampleStability", parseInt(e.target.value) || 24)}
                placeholder="24"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long sample remains stable
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Temperature (°C)
              </label>
              <Input
                value={workflow.storageTemperature || ""}
                onChange={(e) => handleWorkflowChange("storageTemperature", e.target.value)}
                placeholder="e.g., 2-8°C or Room Temperature"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transport Conditions
              </label>
              <Select
                value={workflow.transportConditions || "ambient"}
                onChange={(value) => handleWorkflowChange("transportConditions", value)}
                options={[
                  { value: "ambient", label: "Ambient Temperature" },
                  { value: "refrigerated", label: "Refrigerated (2-8°C)" },
                  { value: "frozen", label: "Frozen (-20°C)" },
                  { value: "dry_ice", label: "Dry Ice (-80°C)" },
                  { value: "special", label: "Special Handling" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Transport Time (hours)
              </label>
              <Input
                type="number"
                min="1"
                value={workflow.maxTransportTime || ""}
                onChange={(e) => handleWorkflowChange("maxTransportTime", parseInt(e.target.value) || 4)}
                placeholder="4"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Handling Instructions
            </label>
            <Textarea
              value={workflow.specialHandlingInstructions || ""}
              onChange={(e) => handleWorkflowChange("specialHandlingInstructions", e.target.value)}
              placeholder="Any special instructions for sample collection, transport, or handling..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Reagent & Inventory Management */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiPackage className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Reagent & Inventory Management</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Auto-deduct Reagents
              </label>
              <p className="text-xs text-gray-500">
                Automatically deduct reagents when test is ordered
              </p>
            </div>
            <Switch
              checked={workflow.autoDeductReagents || false}
              onChange={(checked) => handleWorkflowChange("autoDeductReagents", checked)}
            />
          </div>

          {workflow.autoDeductReagents && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Reagents
                </label>
                <Textarea
                  value={workflow.requiredReagents || ""}
                  onChange={(e) => handleWorkflowChange("requiredReagents", e.target.value)}
                  placeholder="List reagents and quantities required (e.g., Reagent A: 0.5ml, Reagent B: 1ml)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reagent Cost per Test (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={workflow.reagentCostPerTest || ""}
                    onChange={(e) => handleWorkflowChange("reagentCostPerTest", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock Alert
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={workflow.minStockAlert || ""}
                    onChange={(e) => handleWorkflowChange("minStockAlert", parseInt(e.target.value) || 10)}
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when reagent stock falls below this level
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consumables Required
            </label>
            <Textarea
              value={workflow.consumablesRequired || ""}
              onChange={(e) => handleWorkflowChange("consumablesRequired", e.target.value)}
              placeholder="List consumables needed (e.g., Tips, Tubes, Slides, etc.)"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Staff & Resource Requirements */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Staff & Resource Requirements</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Staff Count
            </label>
            <Input
              type="number"
              min="1"
              value={workflow.requiredStaffCount || ""}
              onChange={(e) => handleWorkflowChange("requiredStaffCount", parseInt(e.target.value) || 1)}
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Level Required
            </label>
            <Select
              value={workflow.skillLevelRequired || "intermediate"}
              onChange={(value) => handleWorkflowChange("skillLevelRequired", value)}
              options={[
                { value: "basic", label: "Basic" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
                { value: "expert", label: "Expert/Specialist" }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Processing Time per Sample (minutes)
            </label>
            <Input
              type="number"
              min="1"
              value={workflow.processingTimePerSample || ""}
              onChange={(e) => handleWorkflowChange("processingTimePerSample", parseInt(e.target.value) || 5)}
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Daily Capacity
            </label>
            <Input
              type="number"
              min="1"
              value={workflow.maxDailyCapacity || ""}
              onChange={(e) => handleWorkflowChange("maxDailyCapacity", parseInt(e.target.value) || 100)}
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of tests per day
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Qualifications Required
          </label>
          <Textarea
            value={workflow.specialQualifications || ""}
            onChange={(e) => handleWorkflowChange("specialQualifications", e.target.value)}
            placeholder="Any special certifications, training, or qualifications required..."
            rows={2}
          />
        </div>
      </Card>

      {/* Workflow Summary */}
      <Card className="p-6 bg-healthcare-50">
        <div className="flex items-center gap-2 mb-4">
          <FiCheckCircle className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-healthcare-900">Workflow Summary</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {calculateTotalTAT()}h
            </div>
            <div className="text-sm text-healthcare-700">Total TAT</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {workflow.processingType === "inhouse" ? "In-house" : workflow.processingType === "outsourced" ? "Outsourced" : "Hybrid"}
            </div>
            <div className="text-sm text-healthcare-700">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {selectedDays.length}/7
            </div>
            <div className="text-sm text-healthcare-700">Days Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {workflow.maxDailyCapacity || 0}
            </div>
            <div className="text-sm text-healthcare-700">Daily Capacity</div>
          </div>
        </div>

        {workflow.available24x7 && (
          <div className="mt-4 pt-4 border-t border-healthcare-200">
            <Badge variant="success" className="mr-2">24/7 Available</Badge>
            {workflow.holidayProcessing && (
              <Badge variant="info">Holiday Processing</Badge>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkflowConfiguration;