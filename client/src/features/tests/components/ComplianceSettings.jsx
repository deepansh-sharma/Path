import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FiShield, 
  FiFileText, 
  FiAlertTriangle, 
  FiGlobe, 
  FiLock,
  FiCheckCircle,
  FiInfo,
  FiDownload,
  FiUpload
} from "react-icons/fi";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Switch } from "../../../components/ui/Switch";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Textarea } from "../../../components/ui/Textarea";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

const ComplianceSettings = ({ compliance, onChange, errors = {} }) => {
  const [uploadingConsent, setUploadingConsent] = useState(false);

  // LOINC code categories
  const loincCategories = [
    { value: "laboratory", label: "Laboratory" },
    { value: "clinical", label: "Clinical" },
    { value: "survey", label: "Survey" },
    { value: "document", label: "Document" }
  ];

  // Regulatory authorities
  const regulatoryAuthorities = [
    { value: "nabl", label: "NABL (National Accreditation Board)" },
    { value: "cap", label: "CAP (College of American Pathologists)" },
    { value: "iso15189", label: "ISO 15189" },
    { value: "clia", label: "CLIA (Clinical Laboratory Improvement Amendments)" },
    { value: "fda", label: "FDA (Food and Drug Administration)" },
    { value: "who", label: "WHO (World Health Organization)" },
    { value: "icmr", label: "ICMR (Indian Council of Medical Research)" },
    { value: "other", label: "Other" }
  ];

  // Biohazard levels
  const biohazardLevels = [
    { value: "bsl1", label: "BSL-1 (Minimal Risk)" },
    { value: "bsl2", label: "BSL-2 (Moderate Risk)" },
    { value: "bsl3", label: "BSL-3 (High Risk)" },
    { value: "bsl4", label: "BSL-4 (Extreme Risk)" }
  ];

  // Consent types
  const consentTypes = [
    { value: "general", label: "General Medical Consent" },
    { value: "hiv", label: "HIV Testing Consent" },
    { value: "genetic", label: "Genetic Testing Consent" },
    { value: "research", label: "Research Participation Consent" },
    { value: "infectious", label: "Infectious Disease Testing Consent" },
    { value: "pregnancy", label: "Pregnancy Testing Consent" },
    { value: "drug", label: "Drug Testing Consent" },
    { value: "custom", label: "Custom Consent Form" }
  ];

  // Notification requirements
  const notificationRequirements = [
    { value: "government", label: "Government Notification Required" },
    { value: "public_health", label: "Public Health Department" },
    { value: "cdc", label: "CDC Notification" },
    { value: "who", label: "WHO Reporting" },
    { value: "insurance", label: "Insurance Notification" },
    { value: "employer", label: "Employer Notification" }
  ];

  const handleComplianceChange = (field, value) => {
    onChange({ ...compliance, [field]: value });
  };

  const handleArrayFieldChange = (field, value, checked) => {
    const currentArray = compliance[field] || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    handleComplianceChange(field, newArray);
  };

  const handleConsentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingConsent(true);
    // Simulate file upload
    setTimeout(() => {
      handleComplianceChange("consentFormUrl", URL.createObjectURL(file));
      handleComplianceChange("consentFormName", file.name);
      setUploadingConsent(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* International Standards & Codes */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiGlobe className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">International Standards & Codes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LOINC Code
            </label>
            <Input
              value={compliance.loincCode || ""}
              onChange={(e) => handleComplianceChange("loincCode", e.target.value)}
              placeholder="e.g., 33747-0"
              error={errors.loincCode}
            />
            <p className="text-xs text-gray-500 mt-1">
              Logical Observation Identifiers Names and Codes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LOINC Category
            </label>
            <Select
              value={compliance.loincCategory || ""}
              onChange={(value) => handleComplianceChange("loincCategory", value)}
              options={loincCategories}
              placeholder="Select category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPT Code
            </label>
            <Input
              value={compliance.cptCode || ""}
              onChange={(e) => handleComplianceChange("cptCode", e.target.value)}
              placeholder="e.g., 85025"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current Procedural Terminology
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ICD-10 Code
            </label>
            <Input
              value={compliance.icd10Code || ""}
              onChange={(e) => handleComplianceChange("icd10Code", e.target.value)}
              placeholder="e.g., Z01.812"
            />
            <p className="text-xs text-gray-500 mt-1">
              International Classification of Diseases
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SNOMED CT Code
            </label>
            <Input
              value={compliance.snomedCode || ""}
              onChange={(e) => handleComplianceChange("snomedCode", e.target.value)}
              placeholder="e.g., 26604007"
            />
            <p className="text-xs text-gray-500 mt-1">
              Systematized Nomenclature of Medicine Clinical Terms
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UCUM Unit Code
            </label>
            <Input
              value={compliance.ucumCode || ""}
              onChange={(e) => handleComplianceChange("ucumCode", e.target.value)}
              placeholder="e.g., g/dL"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unified Code for Units of Measure
            </p>
          </div>
        </div>
      </Card>

      {/* Regulatory Compliance */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiShield className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Regulatory Compliance</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Accreditation Standards
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {regulatoryAuthorities.map((authority) => (
                <div key={authority.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={compliance.accreditationStandards?.includes(authority.value) || false}
                    onChange={(checked) => handleArrayFieldChange("accreditationStandards", authority.value, checked)}
                  />
                  <label className="text-sm text-gray-700">{authority.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NABL Test Code
              </label>
              <Input
                value={compliance.nablTestCode || ""}
                onChange={(e) => handleComplianceChange("nablTestCode", e.target.value)}
                placeholder="e.g., NABL-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISO 15189 Reference
              </label>
              <Input
                value={compliance.iso15189Reference || ""}
                onChange={(e) => handleComplianceChange("iso15189Reference", e.target.value)}
                placeholder="e.g., ISO-REF-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAP Survey Code
              </label>
              <Input
                value={compliance.capSurveyCode || ""}
                onChange={(e) => handleComplianceChange("capSurveyCode", e.target.value)}
                placeholder="e.g., CAP-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CLIA Complexity
              </label>
              <Select
                value={compliance.cliaComplexity || ""}
                onChange={(value) => handleComplianceChange("cliaComplexity", value)}
                options={[
                  { value: "", label: "Not Applicable" },
                  { value: "waived", label: "Waived" },
                  { value: "moderate", label: "Moderate Complexity" },
                  { value: "high", label: "High Complexity" }
                ]}
                placeholder="Select complexity"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Consent Management */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFileText className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Consent Management</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Consent Required
              </label>
              <p className="text-xs text-gray-500">
                Patient consent required before performing this test
              </p>
            </div>
            <Switch
              checked={compliance.consentRequired || false}
              onChange={(checked) => handleComplianceChange("consentRequired", checked)}
            />
          </div>

          {compliance.consentRequired && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Consent Types
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {consentTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={compliance.consentTypes?.includes(type.value) || false}
                        onChange={(checked) => handleArrayFieldChange("consentTypes", type.value, checked)}
                      />
                      <label className="text-sm text-gray-700">{type.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consent Form Upload
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("consent-upload").click()}
                    disabled={uploadingConsent}
                    leftIcon={uploadingConsent ? null : FiUpload}
                  >
                    {uploadingConsent ? "Uploading..." : "Upload Consent Form"}
                  </Button>
                  <input
                    id="consent-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleConsentUpload}
                    className="hidden"
                  />
                  {compliance.consentFormName && (
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{compliance.consentFormName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={FiDownload}
                        onClick={() => window.open(compliance.consentFormUrl)}
                      >
                        View
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload PDF or Word document (max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consent Validity Period (days)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={compliance.consentValidityDays || ""}
                  onChange={(e) => handleComplianceChange("consentValidityDays", parseInt(e.target.value) || 30)}
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long the consent remains valid
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Biohazard & Safety */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiAlertTriangle className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Biohazard & Safety</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biohazard Level
            </label>
            <Select
              value={compliance.biohazardLevel || ""}
              onChange={(value) => handleComplianceChange("biohazardLevel", value)}
              options={[{ value: "", label: "No Special Handling" }, ...biohazardLevels]}
              placeholder="Select biohazard level"
            />
          </div>

          {compliance.biohazardLevel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Safety Precautions
                </label>
                <Textarea
                  value={compliance.safetyPrecautions || ""}
                  onChange={(e) => handleComplianceChange("safetyPrecautions", e.target.value)}
                  placeholder="Describe specific safety measures and precautions..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disposal Instructions
                </label>
                <Textarea
                  value={compliance.disposalInstructions || ""}
                  onChange={(e) => handleComplianceChange("disposalInstructions", e.target.value)}
                  placeholder="Describe proper disposal procedures..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Protective Equipment (PPE)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "gloves", label: "Gloves" },
                    { value: "mask", label: "Face Mask" },
                    { value: "goggles", label: "Safety Goggles" },
                    { value: "gown", label: "Lab Gown" },
                    { value: "respirator", label: "Respirator" },
                    { value: "face_shield", label: "Face Shield" },
                    { value: "shoe_covers", label: "Shoe Covers" },
                    { value: "hair_cover", label: "Hair Cover" }
                  ].map((ppe) => (
                    <div key={ppe.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={compliance.requiredPPE?.includes(ppe.value) || false}
                        onChange={(checked) => handleArrayFieldChange("requiredPPE", ppe.value, checked)}
                      />
                      <label className="text-sm text-gray-700">{ppe.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Notification Requirements */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiInfo className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Requirements</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mandatory Reporting
              </label>
              <p className="text-xs text-gray-500">
                Results must be reported to authorities
              </p>
            </div>
            <Switch
              checked={compliance.mandatoryReporting || false}
              onChange={(checked) => handleComplianceChange("mandatoryReporting", checked)}
            />
          </div>

          {compliance.mandatoryReporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Notification Recipients
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {notificationRequirements.map((requirement) => (
                    <div key={requirement.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={compliance.notificationRecipients?.includes(requirement.value) || false}
                        onChange={(checked) => handleArrayFieldChange("notificationRecipients", requirement.value, checked)}
                      />
                      <label className="text-sm text-gray-700">{requirement.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Timeline (hours)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={compliance.notificationTimelineHours || ""}
                    onChange={(e) => handleComplianceChange("notificationTimelineHours", parseInt(e.target.value) || 24)}
                    placeholder="24"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time limit for mandatory reporting
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Critical Value Threshold
                  </label>
                  <Input
                    value={compliance.criticalValueThreshold || ""}
                    onChange={(e) => handleComplianceChange("criticalValueThreshold", e.target.value)}
                    placeholder="e.g., >100 or <5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Values that trigger immediate notification
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporting Instructions
                </label>
                <Textarea
                  value={compliance.reportingInstructions || ""}
                  onChange={(e) => handleComplianceChange("reportingInstructions", e.target.value)}
                  placeholder="Specific instructions for reporting results..."
                  rows={3}
                />
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Privacy & Data Protection */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiLock className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-gray-900">Privacy & Data Protection</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  HIPAA Compliant
                </label>
                <p className="text-xs text-gray-500">
                  Follows HIPAA privacy rules
                </p>
              </div>
              <Switch
                checked={compliance.hipaaCompliant || false}
                onChange={(checked) => handleComplianceChange("hipaaCompliant", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  GDPR Compliant
                </label>
                <p className="text-xs text-gray-500">
                  Follows GDPR data protection
                </p>
              </div>
              <Switch
                checked={compliance.gdprCompliant || false}
                onChange={(checked) => handleComplianceChange("gdprCompliant", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Data Encryption Required
                </label>
                <p className="text-xs text-gray-500">
                  Results must be encrypted
                </p>
              </div>
              <Switch
                checked={compliance.dataEncryptionRequired || false}
                onChange={(checked) => handleComplianceChange("dataEncryptionRequired", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Audit Trail Required
                </label>
                <p className="text-xs text-gray-500">
                  Track all access and changes
                </p>
              </div>
              <Switch
                checked={compliance.auditTrailRequired || false}
                onChange={(checked) => handleComplianceChange("auditTrailRequired", checked)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Retention Period (years)
            </label>
            <Input
              type="number"
              min="1"
              max="50"
              value={compliance.dataRetentionYears || ""}
              onChange={(e) => handleComplianceChange("dataRetentionYears", parseInt(e.target.value) || 7)}
              placeholder="7"
            />
            <p className="text-xs text-gray-500 mt-1">
              How long test results must be retained
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Restrictions
            </label>
            <Textarea
              value={compliance.accessRestrictions || ""}
              onChange={(e) => handleComplianceChange("accessRestrictions", e.target.value)}
              placeholder="Describe who can access results and under what conditions..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Compliance Summary */}
      <Card className="p-6 bg-healthcare-50">
        <div className="flex items-center gap-2 mb-4">
          <FiCheckCircle className="w-5 h-5 text-healthcare-600" />
          <h3 className="text-lg font-semibold text-healthcare-900">Compliance Summary</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {(compliance.accreditationStandards?.length || 0)}
            </div>
            <div className="text-sm text-healthcare-700">Standards</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {compliance.consentRequired ? "Yes" : "No"}
            </div>
            <div className="text-sm text-healthcare-700">Consent Required</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {compliance.biohazardLevel ? "Yes" : "No"}
            </div>
            <div className="text-sm text-healthcare-700">Special Handling</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-healthcare-600">
              {compliance.mandatoryReporting ? "Yes" : "No"}
            </div>
            <div className="text-sm text-healthcare-700">Reporting Required</div>
          </div>
        </div>

        {(compliance.loincCode || compliance.cptCode || compliance.icd10Code) && (
          <div className="mt-4 pt-4 border-t border-healthcare-200">
            <div className="flex flex-wrap gap-2">
              {compliance.loincCode && (
                <Badge variant="secondary">LOINC: {compliance.loincCode}</Badge>
              )}
              {compliance.cptCode && (
                <Badge variant="secondary">CPT: {compliance.cptCode}</Badge>
              )}
              {compliance.icd10Code && (
                <Badge variant="secondary">ICD-10: {compliance.icd10Code}</Badge>
              )}
              {compliance.snomedCode && (
                <Badge variant="secondary">SNOMED: {compliance.snomedCode}</Badge>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ComplianceSettings;