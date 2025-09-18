import React from 'react';
import { FiUsers, FiClipboard, FiFileText, FiDollarSign, FiPlus, FiSearch } from 'react-icons/fi';

// Staff Dashboard Component
const StaffDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Staff Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Samples</p>
              <p className="text-2xl font-bold text-gray-900">56</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiClipboard className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reports Generated</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiFileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$12,345</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiDollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <FiPlus className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-medium">Add Patient</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <FiClipboard className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-600 font-medium">New Sample</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <FiFileText className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-600 font-medium">Generate Report</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <FiSearch className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-orange-600 font-medium">Search Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;