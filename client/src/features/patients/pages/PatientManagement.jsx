import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiEye,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiTestTube,
  FaTestTube,
} from "react-icons/fi";
import { FaVial } from "react-icons/fa";
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
import PatientEntryForm from "../components/PatientEntryForm";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { patientApi } from "../../../api/patientApi";
import { useAuth } from "../../../contexts/AuthContext";

const PatientManagement = () => {
  const { user } = useAuth(); // Get authenticated user for lab context
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showPatientEntryForm, setShowPatientEntryForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);

  // Fetch patients from API with pagination and filters
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = {
        page: currentPage,
        limit: patientsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      // Add search parameter
      if (searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }

      // Add gender filter (convert to backend expected format)
      if (filterGender !== "all") {
        queryParams.gender = filterGender;
      }

      // Add category filter
      if (filterDate !== "all") {
        queryParams.category = filterDate;
      }

      console.log('Fetching patients with params:', queryParams);
      const response = await patientApi.getAllPatients(queryParams);
      
      if (response.success) {
        setPatients(response.data.patients || []);
        setTotalPatients(response.data.pagination?.total || 0);
        console.log('Patients fetched successfully:', response.data.patients?.length);
      } else {
        throw new Error(response.message || 'Failed to fetch patients');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to load patients. Please try again.');
      setPatients([]);
      setTotalPatients(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when dependencies change
  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm, filterGender, filterDate, customDateRange]);

  // Mock data (keeping as fallback for development)
  const mockPatients = [
    {
      patientId: "PAT001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+91 98765 43210",
      age: 38,
      gender: "Male",
      address: {
        street: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
      },
      patientCategory: "OPD",
      vipStatus: false,
      lastVisit: "2024-12-15",
      status: "active",
    },
    {
      patientId: "PAT002",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+91 87654 32109",
      age: 34,
      gender: "Female",
      address: {
        street: "456 Oak Avenue",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India",
      },
      patientCategory: "Home Collection",
      vipStatus: true,
      lastVisit: "2024-12-18",
      status: "active",
    },
  ];

  // Remove the old useEffect that set mock data
  // useEffect(() => {
  //   setTimeout(() => {
  //     setPatients(mockPatients);
  //     setIsLoading(false);
  //   }, 800);
  // }, []);

  // Helper function to get date ranges
  const getDateRange = (filterType) => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    switch (filterType) {
      case "today":
        return {
          start: startOfToday,
          end: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      case "week":
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      case "month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        endOfMonth.setHours(23, 59, 59, 999);
        return { start: startOfMonth, end: endOfMonth };
      case "custom":
        if (customDateRange.startDate && customDateRange.endDate) {
          return {
            start: new Date(customDateRange.startDate),
            end: new Date(customDateRange.endDate + "T23:59:59"),
          };
        }
        return null;
      default:
        return null;
    }
  };

  // Filter patients (now done server-side, but keeping client-side for additional filtering)
  const filteredPatients = patients.filter((patient) => {
    // Age filtering (client-side since it's not in the API)
    const matchesAge =
      filterAge === "all" ||
      (filterAge === "child" && patient.age < 18) ||
      (filterAge === "adult" && patient.age >= 18 && patient.age < 60) ||
      (filterAge === "senior" && patient.age >= 60);

    return matchesAge;
  });

  // Server-side pagination - no need for client-side slicing
  // The patients array already contains the correct page data from the API
  const totalPages = Math.ceil(totalPatients / patientsPerPage);

  // Actions
  const handleAddPatient = () => {
    setSelectedPatient(null);
    setShowPatientEntryForm(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientEntryForm(true);
  };

  const handleDeletePatient = async (patientId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this patient?");
      if (!confirmed) return;

      await patientApi.deletePatient(patientId);
      toast.success("Patient deleted successfully");
      
      // Refresh the patient list
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error(error.message || "Failed to delete patient");
    }
  };

  const handleGenerateTests = (patient) => {
    // Pre-populate the form with existing patient data for new test generation
    setSelectedPatient({
      ...patient,
      // Reset test-related fields for new test generation
      selectedTests: [],
      totalAmount: 0,
      finalAmount: 0,
      paymentType: "Cash",
      // Keep patient info but generate new IDs for the test session
      testSessionId: `TS-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setShowPatientEntryForm(true);
    toast.success(`Generating new tests for ${patient.name}`);
  };

  // Handle search with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'gender':
        setFilterGender(value);
        break;
      case 'age':
        setFilterAge(value);
        break;
      case 'date':
        setFilterDate(value);
        break;
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if there's an error and no patients loaded
  if (error && patients.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Failed to load patients
          </div>
          <div className="text-gray-600 text-center max-w-md">
            {error}
          </div>
          <Button onClick={fetchPatients} className="mt-4">
            Try Again
          </Button>
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

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Row 1: Gender, Age, Date */}
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                <select
                  value={filterGender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={filterAge}
                  onChange={(e) => handleFilterChange('age', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Ages</option>
                  <option value="child">Child (&lt;18)</option>
                  <option value="adult">Adult (18-60)</option>
                  <option value="senior">Senior (&gt;60)</option>
                </select>
                <select
                  value={filterDate}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {filterDate === "custom" && (
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Patients ({totalPatients})</CardTitle>
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * patientsPerPage + 1}-
                {Math.min(currentPage * patientsPerPage, totalPatients)} of{" "}
                {totalPatients}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Patient ID</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Contact</th>
                    <th className="text-left py-3 px-4">Age/Gender</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">VIP</th>
                    <th className="text-left py-3 px-4">Last Visit</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-500">
                        {searchTerm || filterGender !== "all" || filterAge !== "all" || filterDate !== "all" 
                          ? "No patients found matching your criteria" 
                          : "No patients registered yet"}
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr
                        key={patient._id || patient.patientId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <Badge variant="outline">{patient.patientId}</Badge>
                        </td>
                        <td className="py-3 px-4">{patient.name}</td>
                        <td className="py-3 px-4">{patient.phone}</td>
                        <td className="py-3 px-4">
                          {patient.age} / {patient.gender}
                        </td>
                        <td className="py-3 px-4">{patient.patientCategory || "N/A"}</td>
                        <td className="py-3 px-4">
                          {patient.vipStatus ? "⭐ VIP" : "Regular"}
                        </td>
                        <td className="py-3 px-4">
                          {patient.lastVisit 
                            ? new Date(patient.lastVisit).toLocaleDateString()
                            : patient.createdAt 
                              ? new Date(patient.createdAt).toLocaleDateString()
                              : "N/A"
                          }
                        </td>
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateTests(patient)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Generate New Tests"
                            >
                              <FaVial className="w-4 h-4" />
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
                              onClick={() =>
                                handleDeletePatient(patient._id || patient.patientId)
                              }
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
      </div>

      {/* ✅ Patient Entry Form Modal */}
      <PatientEntryForm
        open={showPatientEntryForm}
        onOpenChange={setShowPatientEntryForm}
        onSuccess={(data) => {
          // Extract patient data from the nested structure
          const patientData = data.patient || data;
          
          if (selectedPatient) {
            // edit case
            setPatients((prev) =>
              prev.map((p) =>
                p.patientId === selectedPatient.patientId ? patientData : p
              )
            );
            toast.success("Patient updated successfully");
          } else {
            // add case - add new patient to the list
            setPatients((prev) => [...prev, patientData]);
            toast.success("New patient added successfully");
          }
          
          // Close the form after successful registration
          setShowPatientEntryForm(false);
        }}
      />
    </DashboardLayout>
  );
};

export default PatientManagement;
