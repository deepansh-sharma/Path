import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter,
  FiUserCheck, FiUserX, FiMail, FiPhone, FiCalendar,
  FiMapPin, FiShield, FiEye, FiDownload, FiUpload
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from '../components/ui/Toast';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'staff',
    department: '',
    hireDate: '',
    address: '',
    emergencyContact: '',
    isActive: true
  });

  // Mock data
  useEffect(() => {
    const mockStaff = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@healthlab.com',
        phone: '+1 (555) 123-4567',
        role: 'lab_admin',
        department: 'Laboratory',
        hireDate: '2023-01-15',
        address: '123 Main St, City, State 12345',
        emergencyContact: '+1 (555) 987-6543',
        isActive: true,
        lastLogin: '2024-01-15 09:30:00',
        permissions: ['manage_samples', 'view_reports', 'manage_patients']
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@healthlab.com',
        phone: '+1 (555) 234-5678',
        role: 'staff',
        department: 'Reception',
        hireDate: '2023-03-20',
        address: '456 Oak Ave, City, State 12345',
        emergencyContact: '+1 (555) 876-5432',
        isActive: true,
        lastLogin: '2024-01-15 08:45:00',
        permissions: ['manage_patients', 'schedule_appointments']
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@healthlab.com',
        phone: '+1 (555) 345-6789',
        role: 'technician',
        department: 'Laboratory',
        hireDate: '2022-11-10',
        address: '789 Pine St, City, State 12345',
        emergencyContact: '+1 (555) 765-4321',
        isActive: false,
        lastLogin: '2024-01-10 16:20:00',
        permissions: ['process_samples', 'view_reports']
      },
      {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@healthlab.com',
        phone: '+1 (555) 456-7890',
        role: 'staff',
        department: 'Administration',
        hireDate: '2023-06-05',
        address: '321 Elm St, City, State 12345',
        emergencyContact: '+1 (555) 654-3210',
        isActive: true,
        lastLogin: '2024-01-14 14:15:00',
        permissions: ['manage_invoices', 'view_reports']
      }
    ];

    setTimeout(() => {
      setStaff(mockStaff);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'staff',
      department: '',
      hireDate: '',
      address: '',
      emergencyContact: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleEditStaff = (member) => {
    setSelectedStaff(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      hireDate: member.hireDate,
      address: member.address,
      emergencyContact: member.emergencyContact,
      isActive: member.isActive
    });
    setShowEditModal(true);
  };

  const handleToggleStatus = (id) => {
    setStaff(prev => prev.map(member => 
      member.id === id 
        ? { ...member, isActive: !member.isActive }
        : member
    ));
    
    const member = staff.find(m => m.id === id);
    toast.success(`${member.firstName} ${member.lastName} ${member.isActive ? 'deactivated' : 'activated'} successfully`);
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaff(prev => prev.filter(member => member.id !== id));
      toast.success('Staff member deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedStaff) {
      // Update existing staff
      setStaff(prev => prev.map(member => 
        member.id === selectedStaff.id 
          ? { ...member, ...formData }
          : member
      ));
      toast.success('Staff member updated successfully');
      setShowEditModal(false);
    } else {
      // Add new staff
      const newStaff = {
        id: Date.now(),
        ...formData,
        lastLogin: null,
        permissions: getDefaultPermissions(formData.role)
      };
      setStaff(prev => [...prev, newStaff]);
      toast.success('Staff member added successfully');
      setShowAddModal(false);
    }
    
    setSelectedStaff(null);
  };

  const getDefaultPermissions = (role) => {
    switch (role) {
      case 'lab_admin':
        return ['manage_samples', 'view_reports', 'manage_patients', 'manage_staff'];
      case 'technician':
        return ['process_samples', 'view_reports'];
      case 'staff':
        return ['manage_patients', 'schedule_appointments'];
      default:
        return [];
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'lab_admin': return 'bg-purple-100 text-purple-800';
      case 'technician': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportStaffData = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Hire Date'],
      ...filteredStaff.map(member => [
        `${member.firstName} ${member.lastName}`,
        member.email,
        member.phone,
        member.role,
        member.department,
        member.isActive ? 'Active' : 'Inactive',
        member.hireDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Staff data exported successfully');
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
              <FiUsers className="text-blue-600" />
              Staff Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your laboratory staff and their roles</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportStaffData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiDownload size={16} />
              Export
            </Button>
            <Button
              onClick={handleAddStaff}
              className="flex items-center gap-2"
            >
              <FiPlus size={16} />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-green-600">
                  {staff.filter(s => s.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiUserCheck className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Staff</p>
                <p className="text-2xl font-bold text-red-600">
                  {staff.filter(s => !s.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiUserX className="text-red-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(staff.map(s => s.department)).size}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiShield className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search staff by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="lab_admin">Lab Admin</option>
              <option value="technician">Technician</option>
              <option value="staff">Staff</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </Card>

        {/* Staff Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredStaff.map((member) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {member.firstName[0]}{member.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {member.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FiMail size={14} />
                          {member.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FiPhone size={14} />
                          {member.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {member.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={member.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStaff(member)}
                          >
                            <FiEdit3 size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant={member.isActive ? "outline" : "default"}
                            onClick={() => handleToggleStatus(member.id)}
                            className={member.isActive 
                              ? "text-red-600 hover:bg-red-50" 
                              : "text-green-600 hover:bg-green-50"
                            }
                          >
                            {member.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStaff(member.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 size={14} />
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

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || showEditModal) && (
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
                className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="staff">Staff</option>
                        <option value="technician">Technician</option>
                        <option value="lab_admin">Lab Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <Input
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hire Date
                      </label>
                      <Input
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <Input
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active Status
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedStaff(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedStaff ? 'Update Staff' : 'Add Staff'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default StaffManagement;