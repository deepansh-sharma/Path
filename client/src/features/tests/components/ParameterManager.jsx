import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiTrash2, FiEdit3, FiSave, FiX, FiCopy, 
  FiAlertTriangle, FiInfo, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Textarea } from "../../../components/ui/Textarea";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Switch } from "../../../components/ui/Switch";
import { Badge } from "../../../components/ui/Badge";
import { Separator } from "../../../components/ui/Separator";

const ParameterManager = ({ parameters = [], onChange }) => {
  const [editingParameter, setEditingParameter] = useState(null);
  const [expandedParameters, setExpandedParameters] = useState(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultParameter = {
    name: "",
    code: "",
    description: "",
    unit: "",
    dataType: "numeric",
    isCritical: false,
    isCalculated: false,
    calculationFormula: "",
    referenceRanges: [
      {
        id: Date.now(),
        ageGroup: "adult",
        gender: "both",
        condition: "normal",
        minValue: "",
        maxValue: "",
        textValue: "",
        criticalLow: "",
        criticalHigh: "",
        unit: ""
      }
    ],
    grouping: "",
    sortOrder: parameters.length + 1
  };

  const unitOptions = [
    { value: "mg/dL", label: "mg/dL" },
    { value: "g/dL", label: "g/dL" },
    { value: "IU/L", label: "IU/L" },
    { value: "U/L", label: "U/L" },
    { value: "mIU/L", label: "mIU/L" },
    { value: "ng/mL", label: "ng/mL" },
    { value: "pg/mL", label: "pg/mL" },
    { value: "µg/dL", label: "µg/dL" },
    { value: "mmol/L", label: "mmol/L" },
    { value: "µmol/L", label: "µmol/L" },
    { value: "cells/µL", label: "cells/µL" },
    { value: "×10³/µL", label: "×10³/µL" },
    { value: "×10⁶/µL", label: "×10⁶/µL" },
    { value: "%", label: "%" },
    { value: "ratio", label: "Ratio" },
    { value: "index", label: "Index" },
    { value: "score", label: "Score" },
    { value: "text", label: "Text" },
    { value: "other", label: "Other" }
  ];

  const dataTypeOptions = [
    { value: "numeric", label: "Numeric" },
    { value: "text", label: "Text" },
    { value: "boolean", label: "Boolean" },
    { value: "range", label: "Range" },
    { value: "calculated", label: "Calculated" }
  ];

  const ageGroupOptions = [
    { value: "newborn", label: "Newborn (0-28 days)" },
    { value: "infant", label: "Infant (1-12 months)" },
    { value: "child", label: "Child (1-12 years)" },
    { value: "adolescent", label: "Adolescent (13-17 years)" },
    { value: "adult", label: "Adult (18-64 years)" },
    { value: "elderly", label: "Elderly (65+ years)" },
    { value: "all", label: "All Ages" }
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "both", label: "Both" }
  ];

  const conditionOptions = [
    { value: "normal", label: "Normal" },
    { value: "fasting", label: "Fasting" },
    { value: "non-fasting", label: "Non-fasting" },
    { value: "pregnancy", label: "Pregnancy" },
    { value: "post-meal", label: "Post-meal" },
    { value: "exercise", label: "Post-exercise" },
    { value: "medication", label: "On medication" }
  ];

  const handleAddParameter = () => {
    setEditingParameter({ ...defaultParameter, id: Date.now() });
    setShowAddForm(true);
  };

  const handleEditParameter = (parameter) => {
    setEditingParameter({ ...parameter });
    setShowAddForm(true);
  };

  const handleSaveParameter = () => {
    if (!editingParameter.name.trim()) return;

    const updatedParameters = editingParameter.id && parameters.find(p => p.id === editingParameter.id)
      ? parameters.map(p => p.id === editingParameter.id ? editingParameter : p)
      : [...parameters, editingParameter];

    onChange(updatedParameters);
    setEditingParameter(null);
    setShowAddForm(false);
  };

  const handleDeleteParameter = (parameterId) => {
    const updatedParameters = parameters.filter(p => p.id !== parameterId);
    onChange(updatedParameters);
  };

  const handleCloneParameter = (parameter) => {
    const clonedParameter = {
      ...parameter,
      id: Date.now(),
      name: `${parameter.name} (Copy)`,
      code: `${parameter.code}_COPY`
    };
    onChange([...parameters, clonedParameter]);
  };

  const toggleParameterExpansion = (parameterId) => {
    const newExpanded = new Set(expandedParameters);
    if (newExpanded.has(parameterId)) {
      newExpanded.delete(parameterId);
    } else {
      newExpanded.add(parameterId);
    }
    setExpandedParameters(newExpanded);
  };

  const handleReferenceRangeChange = (rangeIndex, field, value) => {
    const updatedRanges = [...editingParameter.referenceRanges];
    updatedRanges[rangeIndex] = { ...updatedRanges[rangeIndex], [field]: value };
    setEditingParameter({ ...editingParameter, referenceRanges: updatedRanges });
  };

  const addReferenceRange = () => {
    const newRange = {
      id: Date.now(),
      ageGroup: "adult",
      gender: "both",
      condition: "normal",
      minValue: "",
      maxValue: "",
      textValue: "",
      criticalLow: "",
      criticalHigh: "",
      unit: editingParameter.unit
    };
    setEditingParameter({
      ...editingParameter,
      referenceRanges: [...editingParameter.referenceRanges, newRange]
    });
  };

  const removeReferenceRange = (rangeIndex) => {
    const updatedRanges = editingParameter.referenceRanges.filter((_, index) => index !== rangeIndex);
    setEditingParameter({ ...editingParameter, referenceRanges: updatedRanges });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Test Parameters</h3>
            <p className="text-sm text-gray-600 mt-1">
              Define measurable components and their reference ranges
            </p>
          </div>
          <Button
            onClick={handleAddParameter}
            leftIcon={FiPlus}
            disabled={showAddForm}
          >
            Add Parameter
          </Button>
        </div>

        {/* Parameter List */}
        <div className="space-y-4">
          {parameters.map((parameter) => (
            <motion.div
              key={parameter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border border-gray-200 rounded-lg"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleParameterExpansion(parameter.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedParameters.has(parameter.id) ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{parameter.name}</h4>
                        {parameter.isCritical && (
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        )}
                        {parameter.isCalculated && (
                          <Badge variant="secondary" className="text-xs">Calculated</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Code: {parameter.code}</span>
                        <span>Unit: {parameter.unit}</span>
                        <span>Type: {parameter.dataType}</span>
                        <span>Ranges: {parameter.referenceRanges?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCloneParameter(parameter)}
                      leftIcon={FiCopy}
                    >
                      Clone
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditParameter(parameter)}
                      leftIcon={FiEdit3}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteParameter(parameter.id)}
                      leftIcon={FiTrash2}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedParameters.has(parameter.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                          <p className="text-sm text-gray-600">
                            {parameter.description || "No description provided"}
                          </p>
                        </div>
                        {parameter.isCalculated && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Calculation Formula</h5>
                            <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                              {parameter.calculationFormula || "No formula provided"}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Reference Ranges */}
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-3">Reference Ranges</h5>
                        <div className="space-y-3">
                          {parameter.referenceRanges?.map((range, index) => (
                            <div key={range.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Age Group:</span>
                                  <p className="text-gray-600">{range.ageGroup}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Gender:</span>
                                  <p className="text-gray-600">{range.gender}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Condition:</span>
                                  <p className="text-gray-600">{range.condition}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Range:</span>
                                  <p className="text-gray-600">
                                    {parameter.dataType === "numeric" 
                                      ? `${range.minValue || "N/A"} - ${range.maxValue || "N/A"} ${range.unit}`
                                      : range.textValue || "N/A"
                                    }
                                  </p>
                                </div>
                              </div>
                              {(range.criticalLow || range.criticalHigh) && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <span className="font-medium text-red-700 text-sm">Critical Values:</span>
                                  <p className="text-red-600 text-sm">
                                    Low: {range.criticalLow || "N/A"}, High: {range.criticalHigh || "N/A"}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}

          {parameters.length === 0 && (
            <div className="text-center py-12">
              <FiInfo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Parameters Added</h3>
              <p className="text-gray-600 mb-4">
                Add parameters to define what this test measures
              </p>
              <Button onClick={handleAddParameter} leftIcon={FiPlus}>
                Add First Parameter
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add/Edit Parameter Form */}
      <AnimatePresence>
        {showAddForm && editingParameter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingParameter.id && parameters.find(p => p.id === editingParameter.id) 
                    ? "Edit Parameter" 
                    : "Add New Parameter"
                  }
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingParameter(null);
                      setShowAddForm(false);
                    }}
                    leftIcon={FiX}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveParameter}
                    leftIcon={FiSave}
                    disabled={!editingParameter.name.trim()}
                  >
                    Save Parameter
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parameter Name *
                      </label>
                      <Input
                        value={editingParameter.name}
                        onChange={(e) => setEditingParameter({
                          ...editingParameter,
                          name: e.target.value
                        })}
                        placeholder="e.g., Hemoglobin"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parameter Code *
                      </label>
                      <Input
                        value={editingParameter.code}
                        onChange={(e) => setEditingParameter({
                          ...editingParameter,
                          code: e.target.value.toUpperCase()
                        })}
                        placeholder="e.g., HGB"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit of Measurement
                      </label>
                      <Select
                        value={editingParameter.unit}
                        onChange={(value) => setEditingParameter({
                          ...editingParameter,
                          unit: value
                        })}
                        options={unitOptions}
                        placeholder="Select unit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Type
                      </label>
                      <Select
                        value={editingParameter.dataType}
                        onChange={(value) => setEditingParameter({
                          ...editingParameter,
                          dataType: value
                        })}
                        options={dataTypeOptions}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grouping
                      </label>
                      <Input
                        value={editingParameter.grouping}
                        onChange={(e) => setEditingParameter({
                          ...editingParameter,
                          grouping: e.target.value
                        })}
                        placeholder="e.g., Complete Blood Count"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <Input
                        type="number"
                        value={editingParameter.sortOrder}
                        onChange={(e) => setEditingParameter({
                          ...editingParameter,
                          sortOrder: parseInt(e.target.value) || 0
                        })}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={editingParameter.description}
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        description: e.target.value
                      })}
                      placeholder="Brief description of what this parameter measures"
                      rows={2}
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Critical Parameter
                        </label>
                        <p className="text-xs text-gray-500">
                          Values outside normal range trigger alerts
                        </p>
                      </div>
                      <Switch
                        checked={editingParameter.isCritical}
                        onChange={(checked) => setEditingParameter({
                          ...editingParameter,
                          isCritical: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Calculated Parameter
                        </label>
                        <p className="text-xs text-gray-500">
                          Value is derived from other parameters
                        </p>
                      </div>
                      <Switch
                        checked={editingParameter.isCalculated}
                        onChange={(checked) => setEditingParameter({
                          ...editingParameter,
                          isCalculated: checked
                        })}
                      />
                    </div>
                  </div>

                  {editingParameter.isCalculated && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calculation Formula
                      </label>
                      <Textarea
                        value={editingParameter.calculationFormula}
                        onChange={(e) => setEditingParameter({
                          ...editingParameter,
                          calculationFormula: e.target.value
                        })}
                        placeholder="e.g., LDL = Total Cholesterol - HDL - (Triglycerides/5)"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                {/* Reference Ranges */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Reference Ranges</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addReferenceRange}
                      leftIcon={FiPlus}
                    >
                      Add Range
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {editingParameter.referenceRanges.map((range, index) => (
                      <div key={range.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium text-gray-900">Range {index + 1}</h5>
                          {editingParameter.referenceRanges.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeReferenceRange(index)}
                              leftIcon={FiTrash2}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Age Group
                            </label>
                            <Select
                              value={range.ageGroup}
                              onChange={(value) => handleReferenceRangeChange(index, "ageGroup", value)}
                              options={ageGroupOptions}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            <Select
                              value={range.gender}
                              onChange={(value) => handleReferenceRangeChange(index, "gender", value)}
                              options={genderOptions}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Condition
                            </label>
                            <Select
                              value={range.condition}
                              onChange={(value) => handleReferenceRangeChange(index, "condition", value)}
                              options={conditionOptions}
                            />
                          </div>
                        </div>

                        {editingParameter.dataType === "numeric" ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Value
                              </label>
                              <Input
                                type="number"
                                step="any"
                                value={range.minValue}
                                onChange={(e) => handleReferenceRangeChange(index, "minValue", e.target.value)}
                                placeholder="0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Value
                              </label>
                              <Input
                                type="number"
                                step="any"
                                value={range.maxValue}
                                onChange={(e) => handleReferenceRangeChange(index, "maxValue", e.target.value)}
                                placeholder="100"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Critical Low
                              </label>
                              <Input
                                type="number"
                                step="any"
                                value={range.criticalLow}
                                onChange={(e) => handleReferenceRangeChange(index, "criticalLow", e.target.value)}
                                placeholder="Optional"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Critical High
                              </label>
                              <Input
                                type="number"
                                step="any"
                                value={range.criticalHigh}
                                onChange={(e) => handleReferenceRangeChange(index, "criticalHigh", e.target.value)}
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expected Value/Text
                            </label>
                            <Input
                              value={range.textValue}
                              onChange={(e) => handleReferenceRangeChange(index, "textValue", e.target.value)}
                              placeholder="e.g., Negative, Positive, Normal"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParameterManager;