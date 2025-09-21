import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter,
  FiDownload, FiShare2, FiEye, FiCopy, FiSend, FiPrinter,
  FiCheckCircle, FiClock, FiAlertCircle, FiUser, FiCalendar,
  FiTag, FiLock, FiUnlock, FiMail
} from 'react-icons/fi';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { toast } from '../../../components/ui/Toast';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'lab_result',
    template: '',
    patientId: '',
    patientName: '',
    description: '',
    priority: 'normal'
  });

  // Mock data
  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        title: 'Blood Test Results - John Doe',
        type: 'lab_result',
        status: 'completed',
        patientId: 'P001',
        patientName: 'John Doe',
        createdBy: 'Dr. Smith',
        createdAt: '2024-01-15T09:30:00',
        completedAt: '2024-01-15T14:20:00',
        priority: 'high',
        template: 'Blood Test Template',
        signed: true,
        signedBy: 'Dr. Smith',
        signedAt: '2024-01-15T14:25:00',
        shared: false,
        content: 'Complete blood count results showing normal values...'
      },
      {
        id: 2,
        title: 'Urine Analysis - Jane Smith',
        type: 'lab_result',
        status: 'pending',
        patientId: 'P002',
        patientName: 'Jane Smith',
        createdBy: 'Lab Tech A',
        createdAt: '2024-01-15T11:00:00',
        completedAt: null,
        priority: 'normal',
        template: 'Urine Analysis Template',
        signed: false,
        signedBy: null,
        signedAt: null,
        shared: false,
        content: 'Urine analysis in progress...'
      },
      {
        id: 3,
        title: 'X-Ray Report - Mike Johnson',
        type: 'imaging',
        status: 'draft',
        patientId: 'P003',
        patientName: 'Mike Johnson',
        createdBy: 'Dr. Wilson',
        createdAt: '2024-01-14T16:45:00',
        completedAt: null,
        priority: 'urgent',
        template: 'X-Ray Template',
        signed: false,
        signedBy: null,
        signedAt: null,
        shared: false,
        content: 'Chest X-ray findings...'
      },
      {
        id: 4,
        title: 'Pathology Report - Sarah Brown',
        type: 'pathology',
        status: 'completed',
        patientId: 'P004',
        patientName: 'Sarah Brown',
        createdBy: 'Dr. Davis',
        createdAt: '2024-01-13T08:15:00',
        completedAt: '2024-01-14T12:30:00',
        priority: 'high',
        template: 'Pathology Template',
        signed: true,
        signedBy: 'Dr. Davis',
        signedAt: '2024-01-14T12:35:00',
        shared: true,
        sharedWith: ['patient@email.com', 'referring@doctor.com'],
        content: 'Tissue biopsy results...'
      }
    ];

    const mockTemplates = [
      {
        id: 1,
        name: 'Blood Test Template',
        type: 'lab_result',
        description: 'Standard template for blood test results',
        content: `
          <h2>Blood Test Results</h2>
          <p><strong>Patient:</strong> {{patientName}}</p>
          <p><strong>Date:</strong> {{date}}</p>
          <p><strong>Test Type:</strong> Complete Blood Count</p>
          
          <h3>Results:</h3>
          <table>
            <tr><td>Hemoglobin:</td><td>{{hemoglobin}} g/dL</td></tr>
            <tr><td>White Blood Cells:</td><td>{{wbc}} /μL</td></tr>
            <tr><td>Platelets:</td><td>{{platelets}} /μL</td></tr>
          </table>
          
          <h3>Interpretation:</h3>
          <p>{{interpretation}}</p>
          
          <h3>Recommendations:</h3>
          <p>{{recommendations}}</p>
        `,
        createdAt: '2024-01-01T00:00:00',
        isActive: true
      },
      {
        id: 2,
        name: 'Urine Analysis Template',
        type: 'lab_result',
        description: 'Standard template for urine analysis',
        content: `
          <h2>Urine Analysis Report</h2>
          <p><strong>Patient:</strong> {{patientName}}</p>
          <p><strong>Date:</strong> {{date}}</p>
          
          <h3>Physical Examination:</h3>
          <p>Color: {{color}}</p>
          <p>Clarity: {{clarity}}</p>
          <p>Specific Gravity: {{specificGravity}}</p>
          
          <h3>Chemical Examination:</h3>
          <p>Protein: {{protein}}</p>
          <p>Glucose: {{glucose}}</p>
          <p>Ketones: {{ketones}}</p>
          
          <h3>Microscopic Examination:</h3>
          <p>RBC: {{rbc}}</p>
          <p>WBC: {{wbc}}</p>
          <p>Bacteria: {{bacteria}}</p>
          
          <h3>Conclusion:</h3>
          <p>{{conclusion}}</p>
        `,
        createdAt: '2024-01-01T00:00:00',
        isActive: true
      }
    ];

    setTimeout(() => {
      setReports(mockReports);
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateReport = () => {
    setFormData({
      title: '',
      type: 'lab_result',
      template: '',
      patientId: '',
      patientName: '',
      description: '',
      priority: 'normal'
    });
    setShowCreateModal(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setEditorContent(report.content);
    setShowEditorModal(true);
  };

  const handleSignReport = (id) => {
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { 
            ...report, 
            signed: true, 
            signedBy: 'Current User',
            signedAt: new Date().toISOString(),
            status: 'completed'
          }
        : report
    ));
    toast.success('Report signed successfully');
  };

  const handleShareReport = (report) => {
    const shareData = {
      title: report.title,
      text: `Report: ${report.title} for ${report.patientName}`,
      url: `${window.location.origin}/reports/${report.id}`
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Report link copied to clipboard');
    }
  };

  const handleDownloadReport = (report) => {
    const content = `
      Report: ${report.title}
      Patient: ${report.patientName} (${report.patientId})
      Created by: ${report.createdBy}
      Date: ${new Date(report.createdAt).toLocaleDateString()}
      Status: ${report.status}
      
      Content:
      ${report.content}
      
      ${report.signed ? `Digitally signed by ${report.signedBy} on ${new Date(report.signedAt).toLocaleDateString()}` : 'Not signed'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully');
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    
    const selectedTemplate = templates.find(t => t.id === parseInt(formData.template));
    
    const newReport = {
      id: Date.now(),
      ...formData,
      status: 'draft',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      completedAt: null,
      template: selectedTemplate?.name || '',
      signed: false,
      signedBy: null,
      signedAt: null,
      shared: false,
      content: selectedTemplate?.content || 'Report content...'
    };
    
    setReports(prev => [...prev, newReport]);
    toast.success('Report created successfully');
    setShowCreateModal(false);
  };

  const handleSaveEditor = () => {
    if (selectedReport) {
      setReports(prev => prev.map(report => 
        report.id === selectedReport.id 
          ? { ...report, content: editorContent }
          : report
      ));
      toast.success('Report updated successfully');
      setShowEditorModal(false);
      setSelectedReport(null);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiFileText className="text-blue-600" />
              Report Management
            </h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage laboratory reports</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowTemplateModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiTag size={16} />
              Templates
            </Button>
            <Button
              onClick={handleCreateReport}
              className="flex items-center gap-2"
            >
              <FiPlus size={16} />
              Create Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiFileText className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="text-yellow-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reports.filter(r => r.signed).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiLock className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search reports by title, patient, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="lab_result">Lab Result</option>
              <option value="imaging">Imaging</option>
              <option value="pathology">Pathology</option>
            </select>
          </div>
        </Card>

        {/* Reports Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredReports.map((report) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.type.replace('_', ' ').toUpperCase()} • ID: {report.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.patientName}</div>
                        <div className="text-sm text-gray-500">{report.patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge className={getStatusBadgeColor(report.status)}>
                            {report.status.toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityBadgeColor(report.priority)}>
                            {report.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {report.createdBy}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.signed ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <FiLock size={14} />
                            <span className="text-sm">Signed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <FiUnlock size={14} />
                            <span className="text-sm">Unsigned</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReport(report)}
                          >
                            <FiEdit3 size={14} />
                          </Button>
                          {!report.signed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSignReport(report.id)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <FiLock size={14} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareReport(report)}
                          >
                            <FiShare2 size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <FiDownload size={14} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Report Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-2xl"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Report</h2>
                
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter report title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="lab_result">Lab Result</option>
                        <option value="imaging">Imaging</option>
                        <option value="pathology">Pathology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template
                      </label>
                      <select
                        value={formData.template}
                        onChange={(e) => setFormData({...formData, template: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Template</option>
                        {templates.filter(t => t.type === formData.type).map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient ID
                      </label>
                      <Input
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        placeholder="Enter patient ID"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Name
                      </label>
                      <Input
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        placeholder="Enter patient name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter report description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Report
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Editor Modal */}
        <AnimatePresence>
          {showEditorModal && selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Report: {selectedReport.title}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEditorModal(false);
                        setSelectedReport(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEditor}>
                      Save Changes
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Enter report content..."
                    rows={20}
                    className="w-full border-0 focus:outline-none resize-none"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates Modal */}
        <AnimatePresence>
          {showTemplateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Report Templates</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateModal(false)}
                  >
                    Close
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map(template => (
                    <Card key={template.id} className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <Badge className="mb-3">
                        {template.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FiEye size={14} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FiEdit3 size={14} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FiCopy size={14} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ReportManagement;