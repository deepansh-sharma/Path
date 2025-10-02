import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

function QuickTestCreator({ onTestCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "",
    category: "",
    description: "",
    specimen: {
      type: "",
      container: "",
      containerColor: "",
      volume: { amount: "", unit: "ml" },
      storageConditions: {
        temperature: "",
        duration: "",
        specialRequirements: "",
      },
      stabilityDuration: "",
      collectionInstructions: "",
      handlingPrecautions: "",
      ppeRequirements: [],
    },
    pricing: { basePrice: 0, discountEligible: false, insuranceCovered: false },
    turnaroundTime: { routine: { duration: 24, unit: "hours" } },
    workflow: { methodology: "", technicianNotes: "" },
    reporting: { resultFormat: "" },
    parameters: [],
  });

  const handleNestedChange = (group, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [group]: { ...prev[group], [field]: value },
    }));
  };
  const handleSpecimenChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      specimen: { ...prev.specimen, [field]: value },
    }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newParameter, setNewParameter] = useState({
    name: "",
    unit: "",
    referenceRange: "",
  });

  const departments = [
    "Hematology",
    "Biochemistry",
    "Microbiology",
    "Pathology",
    "Immunology",
    "Molecular Biology",
    "Cytology",
    "Histopathology",
  ];

  const categories = [
    "Routine",
    "Urgent",
    "STAT",
    "Profile",
    "Panel",
    "Special",
  ];

  const sampleTypes = [
    "Blood",
    "Serum",
    "Plasma",
    "Urine",
    "Stool",
    "CSF",
    "Tissue",
    "Swab",
    "Sputum",
    "Other",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddParameter = () => {
    if (newParameter.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        parameters: [...prev.parameters, { ...newParameter, id: Date.now() }],
      }));
      setNewParameter({ name: "", unit: "", referenceRange: "" });
    }
  };

  const handleRemoveParameter = (id) => {
    setFormData((prev) => ({
      ...prev,
      parameters: prev.parameters.filter((param) => param.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Creating test:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData({
        name: "",
        code: "",
        department: "",
        category: "",
        description: "",
        specimen: {
          type: "",
          container: "",
          containerColor: "",
          volume: { amount: "", unit: "ml" },
          storageConditions: {
            temperature: "",
            duration: "",
            specialRequirements: "",
          },
          stabilityDuration: "",
          collectionInstructions: "",
          handlingPrecautions: "",
          ppeRequirements: [],
        },
        pricing: {
          basePrice: 0,
          discountEligible: false,
          insuranceCovered: false,
        },
        turnaroundTime: { routine: { duration: 24, unit: "hours" } },
        workflow: { methodology: "", technicianNotes: "" },
        reporting: { resultFormat: "" },
        parameters: [],
      });

      onTestCreated();
      alert("Test created successfully!");
    } catch (error) {
      console.error("Error creating test:", error);
      alert("Error creating test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FiPlus className="text-healthcare-600" />
            Create New Test
          </h2>
          <p className="text-gray-600 mt-1">
            Quickly create a new laboratory test with essential information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information Fields ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Complete Blood Count"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Code *
              </label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  handleInputChange("code", e.target.value.toUpperCase())
                }
                placeholder="e.g., CBC"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <Select
                value={formData.department}
                onChange={(value) => handleInputChange("department", value)}
                options={departments.map((dept) => ({
                  value: dept,
                  label: dept,
                }))}
                placeholder="Select department"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(value) => handleInputChange("category", value)}
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                placeholder="Select category"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Type *
              </label>
              <Select
                value={formData.specimen.type}
                onChange={(value) => handleSpecimenChange("type", value)}
                options={sampleTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                placeholder="Select sample type"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (₹) *
              </label>
              <Input
                type="number"
                value={formData.pricing.basePrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: {
                      ...prev.pricing,
                      basePrice: Number(e.target.value),
                    },
                  }))
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turnaround Time (Hours)
              </label>
              <Select
                value={String(formData.turnaroundTime.routine.duration)}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    turnaroundTime: {
                      routine: {
                        ...prev.turnaroundTime.routine,
                        duration: Number(value),
                      },
                    },
                  }))
                }
                options={[
                  { value: "2", label: "2 hours (STAT)" },
                  { value: "4", label: "4 hours (Urgent)" },
                  { value: "24", label: "24 hours (Routine)" },
                  { value: "48", label: "48 hours" },
                  { value: "72", label: "72 hours" },
                  { value: "168", label: "1 week" },
                ]}
              />
            </div>

            {/* --- FIX #2: Add col-span-2 to make this section full-width --- */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specimen Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Container Color
                </label>
                <Select
                  value={formData.specimen.containerColor}
                  onChange={(value) =>
                    handleSpecimenChange("containerColor", value)
                  }
                  options={[
                    "purple",
                    "yellow",
                    "blue",
                    "red",
                    "green",
                    "other",
                  ].map((c) => ({ value: c, label: c }))}
                  placeholder="Select color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stability Duration
                </label>
                <Input
                  value={formData.specimen.stabilityDuration}
                  onChange={(e) =>
                    handleSpecimenChange("stabilityDuration", e.target.value)
                  }
                  placeholder="e.g., 24 hrs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handling Precautions
                </label>
                <Input
                  value={formData.specimen.handlingPrecautions}
                  onChange={(e) =>
                    handleSpecimenChange("handlingPrecautions", e.target.value)
                  }
                  placeholder="Biohazard level, special notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PPE Requirements
                </label>
                <Input
                  value={(formData.specimen.ppeRequirements || []).join(", ")}
                  onChange={(e) =>
                    handleSpecimenChange(
                      "ppeRequirements",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  placeholder="e.g., gloves, face shield"
                />
              </div>
              {/* Workflow */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Methodology
                </label>
                <Select
                  value={formData.workflow.methodology}
                  onChange={(value) =>
                    handleNestedChange("workflow", "methodology", value)
                  }
                  options={[
                    "PCR",
                    "ELISA",
                    "Automated Analyzer",
                    "Manual Microscopy",
                    "Other",
                  ].map((m) => ({ value: m, label: m }))}
                  placeholder="Select methodology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technician Notes
                </label>
                <Input
                  value={formData.workflow.technicianNotes}
                  onChange={(e) =>
                    handleNestedChange(
                      "workflow",
                      "technicianNotes",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Transport on ice"
                />
              </div>
              {/* Reporting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Result Format
                </label>
                <Select
                  value={formData.reporting.resultFormat}
                  onChange={(value) =>
                    handleNestedChange("reporting", "resultFormat", value)
                  }
                  options={[
                    "numeric",
                    "text",
                    "image",
                    "positive/negative",
                  ].map((r) => ({ value: r, label: r }))}
                  placeholder="Select format"
                />
              </div>
              {/* Finance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Covered
                </label>
                <Select
                  value={formData.pricing.insuranceCovered ? "yes" : "no"}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        insuranceCovered: value === "yes",
                      },
                    }))
                  }
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  placeholder="Select"
                />
              </div>
            </div>

            {/* --- FIX #2: Add col-span-2 to make this section full-width --- */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Test Parameters
              </label>
              {/* Add Parameter Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <Input
                    value={newParameter.name}
                    onChange={(e) =>
                      setNewParameter((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Parameter name"
                  />
                  <Input
                    value={newParameter.unit}
                    onChange={(e) =>
                      setNewParameter((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                    placeholder="Unit (e.g., mg/dL)"
                  />
                  <Input
                    value={newParameter.referenceRange}
                    onChange={(e) =>
                      setNewParameter((prev) => ({
                        ...prev,
                        referenceRange: e.target.value,
                      }))
                    }
                    placeholder="Reference range"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddParameter}
                  size="sm"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Parameter
                </Button>
              </div>
              {/* Parameters List */}
              {formData.parameters.length > 0 && (
                <div className="space-y-2">
                  {formData.parameters.map((param) => (
                    <div
                      key={param.id}
                      className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {param.name}
                        </span>
                        {param.unit && (
                          <span className="text-gray-500 ml-2">
                            ({param.unit})
                          </span>
                        )}
                        {param.referenceRange && (
                          <span className="text-sm text-gray-600 ml-2">
                            Range: {param.referenceRange}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveParameter(param.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- FIX #1: This div is where the extra ">" was --- */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onTestCreated()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-healthcare-600 hover:bg-healthcare-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus className="w-4 h-4 mr-2" />
                    Create Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
export default QuickTestCreator;
