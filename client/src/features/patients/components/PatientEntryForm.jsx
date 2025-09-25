import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  CreditCard,
  Home,
  Truck,
  Send,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { patientApi } from "../../../api/patientApi";
import {
  validatePatientForm,
  validateEmail,
  validatePhone,
  validateName,
  validateAge,
  validateDateOfBirth,
  validateAddress,
  validateBloodGroup,
  validateAmount,
  validateDiscount,
  validateCollectionDate,
  validateSelectedTests,
} from "../../../utils/validators";

const PatientEntryForm = ({ open, onOpenChange, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTests, setSelectedTests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [testSearchTerm, setTestSearchTerm] = useState("");
  const [recentTests, setRecentTests] = useState([1, 3, 5, 8]); // Mock recent test IDs
  const [frequentTests, setFrequentTests] = useState([2, 4, 6]); // Mock frequent test IDs
  const [registrationData, setRegistrationData] = useState(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);
  const [existingDoctors, setExistingDoctors] = useState([
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialization: "Cardiologist",
      hospital: "Apollo Hospital",
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialization: "Neurologist",
      hospital: "Max Healthcare",
    },
    {
      id: 3,
      name: "Dr. Amit Patel",
      specialization: "Orthopedic",
      hospital: "Fortis Hospital",
    },
    {
      id: 4,
      name: "Dr. Sunita Verma",
      specialization: "Gynecologist",
      hospital: "AIIMS",
    },
    {
      id: 5,
      name: "Dr. Vikram Singh",
      specialization: "Pediatrician",
      hospital: "Medanta",
    },
  ]);
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    dateOfBirth: "",
    bloodGroup: "",
    // Address
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
    },
    // Medical Info
    allergies: "",
    medicalHistory: "",
    referringDoctor: "",
    patientCategory: "OPD",
    // Payment
    totalAmount: 0,
    discount: 0,
    paymentType: "Cash", // Default to Cash
    finalAmount: 0,
    // Collection
    collectionType: "In-lab",
    assignedTechnician: "",
    collectionDate: "",
    // Notifications
    smsNotification: true,
    emailNotification: true,
    whatsappNotification: false,
    // Admin
    vipStatus: false,
    urgentReport: false,
    notes: "",
    reportDeliveryDate: "",
    // Auto-generated
    patientId: "",
    sampleBarcode: "",
  });
  const [errors, setErrors] = useState({});

  // Enhanced validation errors state
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const steps = [
    {
      id: "basic",
      title: "Basic Information",
      icon: User,
      fields: [
        "name",
        "email",
        "phone",
        "age",
        "gender",
        "dateOfBirth",
        "bloodGroup",
      ],
    },
    {
      id: "address",
      title: "Address & Medical",
      icon: MapPin,
      fields: [
        "address",
        "allergies",
        "medicalHistory",
        "referringDoctor",
        "patientCategory",
      ],
    },
    {
      id: "tests",
      title: "Tests & Payment",
      icon: FileText,
      fields: ["selectedTests", "totalAmount", "paymentType"],
    },
    {
      id: "collection",
      title: "Collection & Final",
      icon: Calendar,
      fields: ["collectionType", "collectionDate", "notifications"],
    },
    {
      id: "success",
      title: "Registration Complete",
      icon: CheckCircle,
      fields: [],
    },
  ];

  const testCatalog = [
    {
      id: "CBC",
      name: "Complete Blood Count",
      price: 300,
      category: "Hematology",
    },
    {
      id: "LFT",
      name: "Liver Function Test",
      price: 800,
      category: "Biochemistry",
    },
    {
      id: "KFT",
      name: "Kidney Function Test",
      price: 600,
      category: "Biochemistry",
    },
    {
      id: "LIPID",
      name: "Lipid Profile",
      price: 500,
      category: "Biochemistry",
    },
    {
      id: "THYROID",
      name: "Thyroid Profile",
      price: 900,
      category: "Hormones",
    },
    {
      id: "DIABETES",
      name: "Diabetes Panel",
      price: 400,
      category: "Biochemistry",
    },
    { id: "URINE", name: "Urine Analysis", price: 200, category: "Pathology" },
    {
      id: "ECG",
      name: "Electrocardiogram",
      price: 150,
      category: "Cardiology",
    },
  ];

  // Auto-generate IDs
  useEffect(() => {
    if (!formData.patientId) {
      const patientId = `PAT${Date.now().toString().slice(-6)}${Math.floor(
        Math.random() * 1000
      )
        .toString()
        .padStart(3, "0")}`;
      const sampleBarcode = `SMP${Date.now().toString().slice(-8)}${Math.floor(
        Math.random() * 10000
      )
        .toString()
        .padStart(4, "0")}`;

      setFormData((prev) => ({
        ...prev,
        patientId,
        sampleBarcode,
      }));
    }
  }, [formData.patientId]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer]);

  // Calculate amounts
  useEffect(() => {
    const baseAmount = selectedTests.reduce((sum, testId) => {
      const test = testCatalog.find((t) => t.id === testId);
      return sum + (test ? test.price : 0);
    }, 0);

    const discountAmount = (baseAmount * (formData.discount || 0)) / 100;
    const finalAmount = baseAmount - discountAmount;

    setFormData((prev) => ({
      ...prev,
      totalAmount: baseAmount,
      finalAmount,
    }));
  }, [selectedTests, formData.discount]);

  // Calculate age from DOB
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Enhanced validation function with comprehensive checks
  const validateStep = (stepIndex) => {
    setIsValidating(true);

    const validation = validatePatientForm(formData, selectedTests, stepIndex);
    setValidationErrors(validation.errors);

    setIsValidating(false);
    return validation.isValid;
  };

  // Enhanced next step handler with comprehensive validation
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      // Show validation errors
      const errorFields = Object.keys(validationErrors).filter(
        (key) => validationErrors[key]
      );
      if (errorFields.length > 0) {
        alert(
          `Please fix the following errors:\n${errorFields
            .map((field) => `• ${validationErrors[field]}`)
            .join("\n")}`
        );
      }
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Real-time field validation
  const validateField = (fieldName, value) => {
    let validation = { isValid: true, message: "" };

    switch (fieldName) {
      case "name":
        validation = validateName(value);
        break;
      case "email":
        validation = validateEmail(value);
        break;
      case "phone":
        validation = validatePhone(value);
        break;
      case "age":
        validation = validateAge(value);
        break;
      case "dateOfBirth":
        validation = validateDateOfBirth(value);
        break;
      case "bloodGroup":
        validation = validateBloodGroup(value);
        break;
      case "city":
      case "state":
      case "zip":
      case "street":
        const addressValidation = validateAddress({
          ...formData.address,
          [fieldName]: value,
        });
        validation = {
          isValid: !addressValidation.errors[fieldName],
          message: addressValidation.errors[fieldName] || "",
        };
        break;
      case "totalAmount":
        validation = validateAmount(value);
        break;
      case "discount":
        validation = validateDiscount(value);
        break;
      case "collectionDate":
        validation = validateCollectionDate(value);
        break;
      default:
        break;
    }

    // Update validation errors
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: validation.isValid ? undefined : validation.message,
    }));

    return validation.isValid;
  };

  // Enhanced input change handler with real-time validation
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));

      // Validate nested field
      validateField(child, value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Validate field
      validateField(field, value);
    }

    // Clear general errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle closing the success step and resetting form
  const handleCloseSuccess = () => {
    // Clear auto-close timer if it exists
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }

    // Reset form for new registration
    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: "Male",
      dateOfBirth: "",
      bloodGroup: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
      },
      allergies: "",
      medicalHistory: "",
      referringDoctor: "",
      patientCategory: "OPD",
      totalAmount: 0,
      discount: 0,
      paymentType: "Cash",
      finalAmount: 0,
      collectionType: "In-lab",
      assignedTechnician: "",
      collectionDate: "",
      smsNotification: true,
      emailNotification: true,
      whatsappNotification: false,
      vipStatus: false,
      urgentReport: false,
      notes: "",
      reportDeliveryDate: "",
      patientId: "",
      sampleBarcode: "",
    });
    setSelectedTests([]);
    setCurrentStep(0);
    setRegistrationData(null);
    onOpenChange(false);
  };

  // Enhanced test selection handler with validation
  const handleTestSelection = (testId) => {
    const updatedTests = selectedTests.includes(testId)
      ? selectedTests.filter((id) => id !== testId)
      : [...selectedTests, testId];

    setSelectedTests(updatedTests);

    // Validate selected tests
    const testsValidation = validateSelectedTests(updatedTests);
    setValidationErrors((prev) => ({
      ...prev,
      selectedTests: testsValidation.isValid
        ? undefined
        : testsValidation.message,
    }));

    // Recalculate amounts
    const selectedTestsData = testCatalog.filter((test) =>
      updatedTests.includes(test.id)
    );
    const total = selectedTestsData.reduce((sum, test) => sum + test.price, 0);
    const discountAmount = (total * (formData.discount || 0)) / 100;
    const finalAmount = total - discountAmount;

    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
      finalAmount: finalAmount,
    }));

    // Validate amounts
    validateField("totalAmount", total);

    if (errors.selectedTests) {
      setErrors((prev) => ({ ...prev, selectedTests: undefined }));
    }
  };

  // Enhanced submit handler with final validation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    setValidationErrors({});

    try {
      // Final comprehensive validation
      const finalValidation = validatePatientForm(
        formData,
        selectedTests,
        steps.length - 1
      );

      if (!finalValidation.isValid) {
        setValidationErrors(finalValidation.errors);
        const errorFields = Object.keys(finalValidation.errors);
        alert(
          `Please fix the following errors before submitting:\n${errorFields
            .map((field) => `• ${finalValidation.errors[field]}`)
            .join("\n")}`
        );
        setIsSubmitting(false);
        return;
      }

      // Prepare submission data for the backend
      const submissionData = {
        // Basic patient information
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth && formData.dateOfBirth.trim()
          ? new Date(formData.dateOfBirth).toISOString()
          : undefined,
        bloodGroup: formData.bloodGroup,

        // Address information
        address: formData.address,

        // Medical information
        allergies: formData.allergies,
        medicalHistory: formData.medicalHistory,
        referringDoctor: formData.referringDoctor,
        patientCategory: formData.patientCategory,

        // Payment information
        totalAmount: formData.totalAmount,
        discount: formData.discount,
        paymentType: formData.paymentType,
        finalAmount: formData.finalAmount,

        // Collection information
        collectionType: formData.collectionType,
        assignedTechnician: formData.assignedTechnician,
        collectionDate: formData.collectionDate && formData.collectionDate.trim()
          ? new Date(formData.collectionDate).toISOString()
          : undefined,

        // Notification preferences
        smsNotification: formData.smsNotification,
        emailNotification: formData.emailNotification,
        whatsappNotification: formData.whatsappNotification,

        // Admin fields
        vipStatus: formData.vipStatus,
        urgentReport: formData.urgentReport,
        notes: formData.notes,
        reportDeliveryDate: formData.reportDeliveryDate && formData.reportDeliveryDate.trim()
          ? new Date(formData.reportDeliveryDate).toISOString()
          : undefined,

        // Selected tests
        selectedTests: selectedTests.map((testId) => {
          const test = testCatalog.find((t) => t.id === testId);
          return { id: testId, name: test.name, price: test.price };
        }),
      };

      // Call the backend API to register the patient
      const response = await patientApi.registerPatient(submissionData);

      if (response.success) {
        // Generate invoice data from response
        const invoiceData = {
          invoiceId: `INV-${Date.now()}`,
          patientId: response.data.patient.patientId,
          patientName: response.data.patient.name,
          patientPhone: response.data.patient.phone,
          tests: submissionData.selectedTests,
          totalAmount: formData.totalAmount,
          discount: formData.discount,
          finalAmount: formData.finalAmount,
          paymentType: formData.paymentType,
          createdAt: new Date().toISOString(),
          status: "Paid",
        };

        // Store registration data for success step
        setRegistrationData({
          patient: response.data.patient,
          invoice: invoiceData,
        });

        // Navigate to success step
        setCurrentStep(steps.length - 1);

        // Set auto-close timer for 5 seconds
        const timer = setTimeout(() => {
          handleCloseSuccess();
        }, 5000);
        setAutoCloseTimer(timer);

        if (onSuccess)
          onSuccess({
            patient: response.data.patient,
            invoice: invoiceData,
          });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Enhanced error handling
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors;
        setValidationErrors(backendErrors);

        const errorMessages = Object.values(backendErrors).join("\n");
        alert(`Registration failed:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        alert(`Registration failed: ${error.response.data.message}`);
      } else {
        alert(
          "Registration failed. Please check your connection and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get field error message
  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || errors[fieldName] || "";
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldName) => {
    return !!(validationErrors[fieldName] || errors[fieldName]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Patient Registration
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Complete patient information and test booking
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">Patient ID</div>
                <div className="font-mono text-sm font-semibold text-blue-600">
                  {formData.patientId}
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : isCompleted
                        ? "bg-green-100 text-green-700"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter patient's full name"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasFieldError("name")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {hasFieldError("name") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("name")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      handleInputChange("dateOfBirth", e.target.value);
                      handleInputChange("age", calculateAge(e.target.value));
                    }}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasFieldError("dateOfBirth")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {hasFieldError("dateOfBirth") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("dateOfBirth")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => {
                      const newAge = parseInt(e.target.value) || 0;
                      handleInputChange("age", newAge);
                      // If age is manually changed, clear DOB to avoid conflicts
                      if (
                        formData.dateOfBirth &&
                        newAge !== calculateAge(formData.dateOfBirth)
                      ) {
                        handleInputChange("dateOfBirth", "");
                      }
                    }}
                    placeholder="Enter age (auto-calculated from DOB)"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasFieldError("age")
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${formData.dateOfBirth ? "bg-gray-50" : ""}`}
                    readOnly={!!formData.dateOfBirth}
                  />
                  {formData.dateOfBirth && (
                    <p className="text-blue-600 text-sm mt-1">
                      Age automatically calculated from date of birth
                    </p>
                  )}
                  {hasFieldError("age") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("age")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter contact number"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasFieldError("phone")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {hasFieldError("phone") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("phone")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasFieldError("email")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {hasFieldError("email") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      handleInputChange("bloodGroup", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasFieldError("bloodGroup")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select blood group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      )
                    )}
                  </select>
                  {hasFieldError("bloodGroup") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("bloodGroup")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) =>
                      handleInputChange("allergies", e.target.value)
                    }
                    placeholder="Enter known allergies (if any)"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address & Medical */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) =>
                        handleInputChange("address.street", e.target.value)
                      }
                      placeholder="Enter street address"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      placeholder="Enter city"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        hasFieldError("address.city")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {hasFieldError("address.city") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("address.city")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        handleInputChange("address.state", e.target.value)
                      }
                      placeholder="Enter state"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors["address.state"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["address.state"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["address.state"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.address.zip}
                      onChange={(e) =>
                        handleInputChange("address.zip", e.target.value)
                      }
                      placeholder="Enter ZIP code"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical History
                    </label>
                    <textarea
                      value={formData.medicalHistory}
                      onChange={(e) =>
                        handleInputChange("medicalHistory", e.target.value)
                      }
                      placeholder="Enter medical history, chronic diseases, ongoing medications"
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referring Doctor
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.referringDoctor}
                        onChange={(e) =>
                          handleInputChange("referringDoctor", e.target.value)
                        }
                        placeholder="Enter referring doctor's name"
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDoctorModal(true)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Select</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Category
                    </label>
                    <select
                      value={formData.patientCategory}
                      onChange={(e) =>
                        handleInputChange("patientCategory", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="OPD">OPD (Outpatient)</option>
                      <option value="Inpatient">Inpatient</option>
                      <option value="Home Collection">Home Collection</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tests & Payment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Tests</h3>

                {/* Test Search */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search tests by name or category..."
                      value={testSearchTerm}
                      onChange={(e) => setTestSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Recent/Frequent Tests */}
                {!testSearchTerm &&
                  (recentTests.length > 0 || frequentTests.length > 0) && (
                    <div className="mb-6">
                      {recentTests.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Recent Tests
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {recentTests.map((testId) => {
                              const test = testCatalog.find(
                                (t) => t.id === testId
                              );
                              if (!test) return null;
                              return (
                                <button
                                  key={testId}
                                  onClick={() => handleTestSelection(testId)}
                                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                    selectedTests.includes(testId)
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                  }`}
                                >
                                  {test.name} - ₹{test.price}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {frequentTests.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Frequently Ordered
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {frequentTests.map((testId) => {
                              const test = testCatalog.find(
                                (t) => t.id === testId
                              );
                              if (!test) return null;
                              return (
                                <button
                                  key={testId}
                                  onClick={() => handleTestSelection(testId)}
                                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                    selectedTests.includes(testId)
                                      ? "bg-green-500 text-white border-green-500"
                                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                  }`}
                                >
                                  {test.name} - ₹{test.price}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* All Tests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testCatalog
                    .filter(
                      (test) =>
                        test.name
                          .toLowerCase()
                          .includes(testSearchTerm.toLowerCase()) ||
                        test.category
                          .toLowerCase()
                          .includes(testSearchTerm.toLowerCase())
                    )
                    .map((test) => (
                      <div
                        key={test.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTests.includes(test.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => handleTestSelection(test.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-gray-500">
                              {test.category}
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              ₹{test.price}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedTests.includes(test.id)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedTests.includes(test.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {hasFieldError("selectedTests") && (
                  <p className="text-red-500 text-sm mt-2">
                    {getFieldError("selectedTests")}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      readOnly
                      className={`w-full px-3 py-2.5 border rounded-lg bg-gray-50 font-semibold ${
                        hasFieldError("totalAmount")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {hasFieldError("totalAmount") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("totalAmount")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        handleInputChange(
                          "discount",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      max="100"
                      placeholder="Enter discount"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        hasFieldError("discount")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {hasFieldError("discount") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("discount")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Amount
                    </label>
                    <input
                      type="number"
                      value={formData.finalAmount}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-green-50 font-bold text-green-700"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type *
                  </label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) =>
                      handleInputChange("paymentType", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasFieldError("paymentType")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select payment type</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Pending">Pending</option>
                  </select>
                  {hasFieldError("paymentType") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("paymentType")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Collection & Final */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Sample Collection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collection Type
                    </label>
                    <select
                      value={formData.collectionType}
                      onChange={(e) =>
                        handleInputChange("collectionType", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="In-lab">In-lab Collection</option>
                      <option value="Home Collection">Home Collection</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collection Date
                    </label>
                    <input
                      type="date"
                      value={formData.collectionDate}
                      onChange={(e) =>
                        handleInputChange("collectionDate", e.target.value)
                      }
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        hasFieldError("collectionDate")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {hasFieldError("collectionDate") && (
                      <p className="text-red-500 text-sm mt-1">
                        {getFieldError("collectionDate")}
                      </p>
                    )}
                  </div>

                  {formData.collectionType === "Home Collection" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Technician
                      </label>
                      <input
                        type="text"
                        value={formData.assignedTechnician}
                        onChange={(e) =>
                          handleInputChange(
                            "assignedTechnician",
                            e.target.value
                          )
                        }
                        placeholder="Enter technician name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Report Date
                    </label>
                    <input
                      type="date"
                      value={formData.reportDeliveryDate}
                      onChange={(e) =>
                        handleInputChange("reportDeliveryDate", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.sampleBarcode}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.smsNotification}
                      onChange={(e) =>
                        handleInputChange("smsNotification", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      SMS Notifications
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.emailNotification}
                      onChange={(e) =>
                        handleInputChange("emailNotification", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.whatsappNotification}
                      onChange={(e) =>
                        handleInputChange(
                          "whatsappNotification",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      WhatsApp Notifications
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Additional Options
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.vipStatus}
                      onChange={(e) =>
                        handleInputChange("vipStatus", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      VIP Status (Priority handling)
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.urgentReport}
                      onChange={(e) =>
                        handleInputChange("urgentReport", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Urgent Report (Additional charges may apply)
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Enter any special instructions or notes"
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Registration Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Patient Name:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Patient ID:</p>
                    <p className="font-mono font-semibold text-blue-600">
                      {formData.patientId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Selected Tests:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTests.length} test(s) selected
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Final Amount:</p>
                    <p className="font-bold text-green-600 text-lg">
                      ₹{formData.finalAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Collection Type:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.collectionType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.paymentType || "Not selected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && registrationData && (
            <div className="space-y-6">
              {/* Success Header with Close Button */}
              <div className="text-center py-8 relative">
                <button
                  onClick={handleCloseSuccess}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">
                  Registration Successful!
                </h2>
                <p className="text-gray-600 text-lg mb-3">
                  Patient has been registered and invoice has been generated
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Auto-closing in 5 seconds
                </div>
              </div>

              {/* Patient Details Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-semibold text-gray-900">
                      {registrationData.patient.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Patient ID:</p>
                    <p className="font-mono font-semibold text-blue-600">
                      {registrationData.patient.patientId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-semibold text-gray-900">
                      {registrationData.patient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-semibold text-gray-900">
                      {registrationData.patient.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Age:</p>
                    <p className="font-semibold text-gray-900">
                      {registrationData.patient.age} years
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Gender:</p>
                    <p className="font-semibold text-gray-900">
                      {registrationData.patient.gender}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Details Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Invoice Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Invoice ID:</p>
                    <p className="font-mono font-semibold text-green-600">
                      {registrationData.invoice.invoiceId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {registrationData.invoice.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method:</p>
                    <p className="font-semibold text-gray-900">
                      {registrationData.invoice.paymentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="font-bold text-green-600 text-lg">
                      ₹{registrationData.invoice.finalAmount}
                    </p>
                  </div>
                </div>

                {/* Selected Tests */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Selected Tests:
                  </h4>
                  <div className="space-y-2">
                    {registrationData.invoice.tests.map((test, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">
                          {test.name}
                        </span>
                        <span className="font-semibold text-gray-700">
                          ₹{test.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    console.log(
                      "Printing invoice:",
                      registrationData.invoice.invoiceId
                    );
                    // Implement print functionality
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Print Invoice
                </button>
                <button
                  onClick={() => {
                    console.log(
                      "Downloading invoice:",
                      registrationData.invoice.invoiceId
                    );
                    // Implement download functionality
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    console.log(
                      "Sending invoice:",
                      registrationData.invoice.invoiceId
                    );
                    // Implement send functionality
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send via Email
                </button>
              </div>

              {/* Action Buttons */}
              <div className="text-center pt-6 border-t">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleCloseSuccess}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Close & Continue
                  </button>
                  <button
                    onClick={() => {
                      // Clear timer and reset for new registration
                      if (autoCloseTimer) {
                        clearTimeout(autoCloseTimer);
                        setAutoCloseTimer(null);
                      }

                      // Reset form for new registration
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        age: "",
                        gender: "Male",
                        dateOfBirth: "",
                        bloodGroup: "",
                        address: {
                          street: "",
                          city: "",
                          state: "",
                          zip: "",
                          country: "India",
                        },
                        allergies: "",
                        medicalHistory: "",
                        referringDoctor: "",
                        patientCategory: "OPD",
                        totalAmount: 0,
                        discount: 0,
                        paymentType: "Cash",
                        finalAmount: 0,
                        collectionType: "In-lab",
                        assignedTechnician: "",
                        collectionDate: "",
                        smsNotification: true,
                        emailNotification: true,
                        whatsappNotification: false,
                        vipStatus: false,
                        urgentReport: false,
                        notes: "",
                        reportDeliveryDate: "",
                        patientId: "",
                        sampleBarcode: "",
                      });
                      setSelectedTests([]);
                      setCurrentStep(0);
                      setRegistrationData(null);
                    }}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Register New Patient
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedTests.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Register Patient
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Selection Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Referring Doctor
              </h3>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search doctors by name, specialization, or hospital..."
                    value={doctorSearchTerm}
                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Doctor List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {existingDoctors
                  .filter(
                    (doctor) =>
                      doctor.name
                        .toLowerCase()
                        .includes(doctorSearchTerm.toLowerCase()) ||
                      doctor.specialization
                        .toLowerCase()
                        .includes(doctorSearchTerm.toLowerCase()) ||
                      doctor.hospital
                        .toLowerCase()
                        .includes(doctorSearchTerm.toLowerCase())
                  )
                  .map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => {
                        handleInputChange("referringDoctor", doctor.name);
                        setShowDoctorModal(false);
                        setDoctorSearchTerm("");
                      }}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {doctor.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {doctor.specialization}
                          </p>
                          <p className="text-sm text-gray-500">
                            {doctor.hospital}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add New Doctor */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    const newDoctorName = prompt("Enter new doctor's name:");
                    if (newDoctorName) {
                      const specialization = prompt("Enter specialization:");
                      const hospital = prompt("Enter hospital/clinic:");

                      const newDoctor = {
                        id: existingDoctors.length + 1,
                        name: newDoctorName,
                        specialization: specialization || "General",
                        hospital: hospital || "Not specified",
                      };

                      setExistingDoctors((prev) => [...prev, newDoctor]);
                      handleInputChange("referringDoctor", newDoctorName);
                      setShowDoctorModal(false);
                      setDoctorSearchTerm("");
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Doctor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientEntryForm;
