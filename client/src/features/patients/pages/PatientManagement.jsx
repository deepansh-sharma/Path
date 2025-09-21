import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit,
  FiEye,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiPhone,
  FiMail,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiX,
  FiSave,
} from "react-icons/fi";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { toast } from "../../../components/ui/Toast";

const PatientManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  // Form state for add/edit patient
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContact: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
  });

  // Mock patient data
  const mockPatients = [
    {
      id: "P001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "+91 98765 43210",
      dateOfBirth: "1985-06-15",
      gender: "Male",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      emergencyContact: "+91 98765 43211",
      bloodGroup: "O+",
      allergies: "None",
      medicalHistory: "Hypertension",
      registrationDate: "2024-01-15",
      lastVisit: "2024-12-15",
      totalTests: 12,
      status: "active",
    },
    {
      id: "P002",
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah.wilson@email.com",
      phone: "+91 87654 32109",
      dateOfBirth: "1990-03-22",
      gender: "Female",
      address: "456 Oak Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      emergencyContact: "+91 87654 32110",
      bloodGroup: "A+",
      allergies: "Penicillin",
      medicalHistory: "Diabetes Type 2",
      registrationDate: "2024-02-20",
      lastVisit: "2024-12-18",
      totalTests: 8,
      status: "active",
    },
    {
      id: "P003",
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.j@email.com",
      phone: "+91 76543 21098",
      dateOfBirth: "1978-11-08",
      gender: "Male",
      address: "789 Pine Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      emergencyContact: "+91 76543 21099",
      bloodGroup: "B+",
      allergies: "Shellfish",
      medicalHistory: "None",
      registrationDate: "2024-03-10",
      lastVisit: "2024-12-10",
      totalTests: 5,
      status: "inactive",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatients(mockPatients);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
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

  // Filter patients based on search and filters
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender =
      filterGender === "all" || patient.gender.toLowerCase() === filterGender;

    const age = calculateAge(patient.dateOfBirth);
    const matchesAge =
      filterAge === "all" ||
      (filterAge === "child" && age < 18) ||
      (filterAge === "adult" && age >= 18 && age < 60) ||
      (filterAge === "senior" && age >= 60);

    return matchesSearch && matchesGender && matchesAge;
  });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPatient = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      emergencyContact: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
    });
    setSelectedPatient(null);
    setShowAddModal(true);
  };

  const handleEditPatient = (patient) => {
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      city: patient.city,
      state: patient.state,
      pincode: patient.pincode,
      emergencyContact: patient.emergencyContact,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
    });
    setSelectedPatient(patient);
    setShowAddModal(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleDeletePatient = (patientId) => {
    toast.error(
      `Delete patient ${patientId} - This would show a confirmation dialog`
    );
  };

  const handleSavePatient = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedPatient) {
      toast.success(`Patient ${selectedPatient.id} updated successfully`);
    } else {
      toast.success("New patient added successfully");
    }
    setShowAddModal(false);
  };

  const PatientModal = () => (
    <AnimatePresence>
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPatient ? "Edit Patient" : "Add New Patient"}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <Input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <Input
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Enter emergency contact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <Input
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="Enter known allergies"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                    placeholder="Enter medical history"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePatient}>
                  <FiSave className="w-4 h-4 mr-2" />
                  {selectedPatient ? "Update Patient" : "Add Patient"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const PatientViewModal = () => (
    <AnimatePresence>
      {showViewModal && selectedPatient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Patient Details
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedPatient.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Phone:</span>
                      <span>{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Age:</span>
                      <span>
                        {calculateAge(selectedPatient.dateOfBirth)} years
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Gender:</span>
                      <span>{selectedPatient.gender}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Blood Group:</span>
                      <Badge variant="secondary">
                        {selectedPatient.bloodGroup}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <FiMapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <span className="font-medium">Address:</span>
                        <div className="text-sm text-gray-600">
                          {selectedPatient.address}
                          <br />
                          {selectedPatient.city}, {selectedPatient.state} -{" "}
                          {selectedPatient.pincode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Emergency Contact:</span>
                      <span>{selectedPatient.emergencyContact}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Allergies:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPatient.allergies || "None"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Medical History:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPatient.medicalHistory || "None"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lab Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Patient ID:</span>
                      <Badge variant="outline">{selectedPatient.id}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Registration Date:</span>
                      <span>{selectedPatient.registrationDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Last Visit:</span>
                      <span>{selectedPatient.lastVisit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Total Tests:</span>
                      <Badge variant="secondary">
                        {selectedPatient.totalTests}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Status:</span>
                      <Badge
                        variant={
                          selectedPatient.status === "active"
                            ? "success"
                            : "destructive"
                        }
                      >
                        {selectedPatient.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handleEditPatient(selectedPatient)}
                >
                  <FiEdit className="w-4 h-4 mr-2" />
                  Edit Patient
                </Button>
                <Button onClick={() => setShowViewModal(false)}>Close</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Patient Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage patient records, history, and information
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <FiUpload className="w-4 h-4" />
              <span>Import</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={handleAddPatient}
              className="flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Patient</span>
            </Button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search patients by name, email, phone, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={filterAge}
                    onChange={(e) => setFilterAge(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="all">All Ages</option>
                    <option value="child">Child (&lt;18)</option>
                    <option value="adult">Adult (18-60)</option>
                    <option value="senior">Senior (&gt;60)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Patients ({filteredPatients.length})</CardTitle>
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstPatient + 1}-
                  {Math.min(indexOfLastPatient, filteredPatients.length)} of{" "}
                  {filteredPatients.length}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Patient ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Age/Gender
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Blood Group
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Last Visit
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <Badge variant="outline">{patient.id}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.city}, {patient.state}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm text-gray-900">
                              {patient.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm text-gray-900">
                              {calculateAge(patient.dateOfBirth)} years
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.gender}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">
                            {patient.bloodGroup}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            {patient.lastVisit}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              patient.status === "active"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {patient.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPatient(patient)}
                            >
                              <FiEye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPatient(patient)}
                            >
                              <FiEdit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modals */}
        <PatientModal />
        <PatientViewModal />
      </div>
    </DashboardLayout>
  );
};

export default PatientManagement;