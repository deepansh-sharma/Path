import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiPrinter,
  FiDownload,
  FiCamera, // Corrected from FiScan
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiGitlab, // Corrected from FiFlask
  FiFileText,
  FiBarChart2, // Corrected from FiBarChart3
  FiX,
  FiSave,
} from "react-icons/fi";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { toast } from "../components/ui/Toast";

const SampleTracking = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [samples, setSamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [samplesPerPage] = useState(10);

  // Form state for add/edit sample
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    testType: "",
    sampleType: "",
    collectionDate: "",
    collectionTime: "",
    collectedBy: "",
    priority: "normal",
    notes: "",
  });

  // Sample status workflow
  const statusWorkflow = [
    { key: "collected", label: "Collected", icon: FiTruck, color: "blue" },
    { key: "received", label: "Received", icon: FiCheckCircle, color: "green" },
    { key: "processing", label: "Processing", icon: FiGitlab, color: "yellow" }, // Corrected from FiFlask
    { key: "completed", label: "Completed", icon: FiFileText, color: "green" },
    { key: "reported", label: "Reported", icon: FiBarChart2, color: "purple" }, // Corrected from FiBarChart3
  ];

  // Mock sample data
  const mockSamples = [
    {
      id: "S001",
      barcode: "1234567890123",
      patientId: "P001",
      patientName: "John Doe",
      testType: "Complete Blood Count",
      sampleType: "Blood",
      status: "processing",
      priority: "high",
      collectionDate: "2024-12-20",
      collectionTime: "09:30",
      collectedBy: "Nurse Sarah",
      receivedDate: "2024-12-20",
      receivedTime: "10:15",
      processingStarted: "2024-12-20 11:00",
      estimatedCompletion: "2024-12-20 15:00",
      notes: "Fasting sample",
      location: "Lab Station 2",
    },
    {
      id: "S002",
      barcode: "1234567890124",
      patientId: "P002",
      patientName: "Sarah Wilson",
      testType: "Lipid Profile",
      sampleType: "Blood",
      status: "completed",
      priority: "normal",
      collectionDate: "2024-12-19",
      collectionTime: "14:20",
      collectedBy: "Technician Mike",
      receivedDate: "2024-12-19",
      receivedTime: "14:45",
      processingStarted: "2024-12-19 15:00",
      completedDate: "2024-12-20 09:30",
      notes: "Regular checkup",
      location: "Lab Station 1",
    },
    {
      id: "S003",
      barcode: "1234567890125",
      patientId: "P003",
      patientName: "Michael Johnson",
      testType: "Urine Analysis",
      sampleType: "Urine",
      status: "collected",
      priority: "normal",
      collectionDate: "2024-12-20",
      collectionTime: "11:45",
      collectedBy: "Nurse Emma",
      notes: "Morning sample",
      location: "Collection Center",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSamples(mockSamples);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter samples
  const filteredSamples = samples.filter((sample) => {
    const matchesSearch =
      sample.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.barcode.includes(searchTerm) ||
      sample.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.testType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || sample.status === filterStatus;
    const matchesType =
      filterType === "all" || sample.sampleType.toLowerCase() === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const indexOfLastSample = currentPage * samplesPerPage;
  const indexOfFirstSample = indexOfLastSample - samplesPerPage;
  const currentSamples = filteredSamples.slice(
    indexOfFirstSample,
    indexOfLastSample
  );
  const totalPages = Math.ceil(filteredSamples.length / samplesPerPage);

  const generateBarcode = () => {
    return Math.random().toString().substr(2, 13);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSample = () => {
    setFormData({
      patientId: "",
      patientName: "",
      testType: "",
      sampleType: "",
      collectionDate: new Date().toISOString().split("T")[0],
      collectionTime: new Date().toTimeString().slice(0, 5),
      collectedBy: "",
      priority: "normal",
      notes: "",
    });
    setSelectedSample(null);
    setShowAddModal(true);
  };

  const handleScanBarcode = () => {
    setShowScanModal(true);
  };

  const handleViewSample = (sample) => {
    setSelectedSample(sample);
    toast.info(`Viewing sample ${sample.id}`);
  };

  const handleUpdateStatus = (sampleId, newStatus) => {
    toast.success(`Sample ${sampleId} status updated to ${newStatus}`);
  };

  const handlePrintBarcode = (sampleId) => {
    toast.info(`Printing barcode for sample ${sampleId}`);
  };

  const handleSaveSample = () => {
    if (!formData.patientId || !formData.testType || !formData.sampleType) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newBarcode = generateBarcode();
    toast.success(`Sample created with barcode: ${newBarcode}`);
    setShowAddModal(false);
  };

  const getStatusColor = (status) => {
    const statusItem = statusWorkflow.find((s) => s.key === status);
    return statusItem ? statusItem.color : "gray";
  };

  const getStatusIcon = (status) => {
    const statusItem = statusWorkflow.find((s) => s.key === status);
    return statusItem ? statusItem.icon : FiClock;
  };

  const StatusProgress = ({ currentStatus }) => {
    const currentIndex = statusWorkflow.findIndex(
      (s) => s.key === currentStatus
    );

    return (
      <div className="flex items-center space-x-2">
        {statusWorkflow.map((status, index) => {
          const Icon = status.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status.key} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                ${
                  isActive
                    ? `bg-${status.color}-100 border-${status.color}-500 text-${status.color}-600`
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }
                ${
                  isCurrent
                    ? "ring-2 ring-offset-2 ring-" + status.color + "-500"
                    : ""
                }
              `}
              >
                <Icon className="w-4 h-4" />
              </div>
              {index < statusWorkflow.length - 1 && (
                <div
                  className={`
                  w-8 h-0.5 mx-1 transition-all duration-300
                  ${
                    index < currentIndex
                      ? `bg-${status.color}-500`
                      : "bg-gray-300"
                  }
                `}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const AddSampleModal = () => (
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
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Sample
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
                    Patient ID *
                  </label>
                  <Input
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    placeholder="Enter patient ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <Input
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter patient name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type *
                  </label>
                  <select
                    name="testType"
                    value={formData.testType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="">Select Test Type</option>
                    <option value="Complete Blood Count">
                      Complete Blood Count
                    </option>
                    <option value="Lipid Profile">Lipid Profile</option>
                    <option value="Liver Function Test">
                      Liver Function Test
                    </option>
                    <option value="Kidney Function Test">
                      Kidney Function Test
                    </option>
                    <option value="Thyroid Function Test">
                      Thyroid Function Test
                    </option>
                    <option value="Urine Analysis">Urine Analysis</option>
                    <option value="Blood Sugar">Blood Sugar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Type *
                  </label>
                  <select
                    name="sampleType"
                    value={formData.sampleType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="">Select Sample Type</option>
                    <option value="Blood">Blood</option>
                    <option value="Urine">Urine</option>
                    <option value="Stool">Stool</option>
                    <option value="Saliva">Saliva</option>
                    <option value="Tissue">Tissue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Date
                  </label>
                  <Input
                    name="collectionDate"
                    type="date"
                    value={formData.collectionDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Time
                  </label>
                  <Input
                    name="collectionTime"
                    type="time"
                    value={formData.collectionTime}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collected By
                  </label>
                  <Input
                    name="collectedBy"
                    value={formData.collectedBy}
                    onChange={handleInputChange}
                    placeholder="Enter collector name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                    placeholder="Enter any additional notes"
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
                <Button onClick={handleSaveSample}>
                  <FiSave className="w-4 h-4 mr-2" />
                  Create Sample
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ScanModal = () => (
    <AnimatePresence>
      {showScanModal && (
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
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Scan Barcode
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanModal(false)}
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiCamera className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Position the barcode within the frame
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Or enter barcode manually"
                    className="text-center"
                  />
                  <Button className="w-full">
                    <FiSearch className="w-4 h-4 mr-2" />
                    Search Sample
                  </Button>
                </div>
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
              Sample Tracking
            </h1>
            <p className="text-gray-600 mt-1">
              Track samples from collection to reporting with barcode system
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleScanBarcode}
              className="flex items-center space-x-2"
            >
              <FiCamera className="w-4 h-4" />
              <span>Scan Barcode</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={handleAddSample}
              className="flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Sample</span>
            </Button>
          </div>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statusWorkflow.map((status) => {
              const Icon = status.icon;
              const count = samples.filter(
                (s) => s.status === status.key
              ).length;

              return (
                <Card
                  key={status.key}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-10 h-10 bg-${status.color}-100 rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                      <Icon className={`w-5 h-5 text-${status.color}-600`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600">{status.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by sample ID, barcode, patient name, or test type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="all">All Status</option>
                    {statusWorkflow.map((status) => (
                      <option key={status.key} value={status.key}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                  >
                    <option value="all">All Types</option>
                    <option value="blood">Blood</option>
                    <option value="urine">Urine</option>
                    <option value="stool">Stool</option>
                    <option value="saliva">Saliva</option>
                    <option value="tissue">Tissue</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Samples Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Samples ({filteredSamples.length})</CardTitle>
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstSample + 1}-
                  {Math.min(indexOfLastSample, filteredSamples.length)} of{" "}
                  {filteredSamples.length}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Sample ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Barcode
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Patient
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Test Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Collection
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSamples.map((sample, index) => {
                      const StatusIcon = getStatusIcon(sample.status);

                      return (
                        <motion.tr
                          key={sample.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <Badge variant="outline">{sample.id}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-mono text-sm">
                              {sample.barcode}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {sample.patientName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {sample.patientId}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm text-gray-900">
                                {sample.testType}
                              </div>
                              <div className="text-sm text-gray-500">
                                {sample.sampleType}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <StatusIcon
                                className={`w-4 h-4 text-${getStatusColor(
                                  sample.status
                                )}-600`}
                              />
                              <Badge
                                variant={
                                  sample.status === "completed" ||
                                  sample.status === "reported"
                                    ? "success"
                                    : sample.status === "processing"
                                    ? "warning"
                                    : "secondary"
                                }
                              >
                                {
                                  statusWorkflow.find(
                                    (s) => s.key === sample.status
                                  )?.label
                                }
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                sample.priority === "urgent"
                                  ? "destructive"
                                  : sample.priority === "high"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {sample.priority}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm text-gray-900">
                                {sample.collectionDate}
                              </div>
                              <div className="text-sm text-gray-500">
                                {sample.collectionTime}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewSample(sample)}
                              >
                                <FiEye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintBarcode(sample.id)}
                              >
                                <FiPrinter className="w-4 h-4" />
                              </Button>
                              <select
                                onChange={(e) =>
                                  handleUpdateStatus(sample.id, e.target.value)
                                }
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-healthcare-500"
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  Update Status
                                </option>
                                {statusWorkflow.map((status) => (
                                  <option key={status.key} value={status.key}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
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

        {/* Sample Progress Visualization */}
        {selectedSample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Sample Progress - {selectedSample.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <StatusProgress currentStatus={selectedSample.status} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Modals */}
        <AddSampleModal />
        <ScanModal />
      </div>
    </DashboardLayout>
  );
};

export default SampleTracking;
