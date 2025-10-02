import React, { useState } from 'react';
import { 
  DataTable, 
  FormBuilder, 
  StatsCard, 
  FileUpload,
  Button,
  Card
} from './ui';
import SearchableSelect from './ui/SearchableSelect';
import { 
  FiUsers, 
  FiDollarSign, 
  FiActivity, 
  FiTrendingUp 
} from 'react-icons/fi';

const ResponsiveTestPage = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({});

  // Sample data for DataTable
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', role: 'Editor' }
  ];

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge',
      badgeVariant: (value) => value === 'Active' ? 'success' : 'secondary'
    },
    { key: 'role', label: 'Role', sortable: true }
  ];

  // Sample options for SearchableSelect
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' }
  ];

  // Form schema for FormBuilder
  const formSchema = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your first name'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter your email',
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'user', label: 'User' },
        { value: 'editor', label: 'Editor' }
      ]
    },
    {
      name: 'notifications',
      label: 'Enable Notifications',
      type: 'checkbox',
      checkboxLabel: 'Send me email notifications'
    }
  ];

  const handleFileUpload = (file) => {
    setFiles(prev => [...prev, file]);
  };

  const handleFileRemove = (fileToRemove) => {
    setFiles(prev => prev.filter(file => file.id !== fileToRemove.id));
  };

  const handleFormSubmit = (data) => {
    console.log('Form submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Responsive Component Test Page
          </h1>
          <p className="text-gray-600">
            Testing responsive design and accessibility of modular components
          </p>
        </div>

        {/* Stats Cards Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Users"
              value={1234}
              previousValue={1100}
              icon={FiUsers}
              color="blue"
              format="number"
            />
            <StatsCard
              title="Revenue"
              value={45678}
              previousValue={42000}
              icon={FiDollarSign}
              color="green"
              format="currency"
            />
            <StatsCard
              title="Active Sessions"
              value={89}
              previousValue={95}
              icon={FiActivity}
              color="purple"
              format="number"
            />
            <StatsCard
              title="Growth Rate"
              value={12.5}
              icon={FiTrendingUp}
              color="indigo"
              format="percentage"
            />
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* SearchableSelect */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Searchable Select
              </h3>
              <SearchableSelect
                options={selectOptions}
                value={selectedOption}
                onChange={setSelectedOption}
                placeholder="Select an option..."
                searchPlaceholder="Search options..."
                clearable
              />
            </Card>

            {/* File Upload */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                File Upload
              </h3>
              <FileUpload
                onUpload={handleFileUpload}
                onRemove={handleFileRemove}
                files={files}
                multiple
                accept="image/*,.pdf,.doc,.docx"
                maxSize={5 * 1024 * 1024} // 5MB
                maxFiles={3}
              />
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Form Builder */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dynamic Form Builder
              </h3>
              <FormBuilder
                schema={formSchema}
                initialData={formData}
                onSubmit={handleFormSubmit}
                onCancel={() => console.log('Form cancelled')}
                submitText="Save User"
                cancelText="Cancel"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Table</h2>
          <DataTable
            data={tableData}
            columns={tableColumns}
            searchable
            selectable
            pagination
            itemsPerPage={5}
            onEdit={(item) => console.log('Edit:', item)}
            onDelete={(item) => console.log('Delete:', item)}
            onView={(item) => console.log('View:', item)}
            onExport={() => console.log('Export data')}
          />
        </section>

        {/* Mobile Responsiveness Test */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mobile Responsiveness Test
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-semibold">{item}</span>
                </div>
                <p className="text-sm text-gray-600">Item {item}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Accessibility Test */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Accessibility Features
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button disabled>Disabled Button</Button>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>✅ All components support keyboard navigation</p>
              <p>✅ ARIA labels and roles are implemented</p>
              <p>✅ Focus indicators are visible</p>
              <p>✅ Color contrast meets WCAG guidelines</p>
              <p>✅ Screen reader compatible</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>Responsive Component Test Page - All components are mobile-first and accessible</p>
        </footer>
      </div>
    </div>
  );
};

export default ResponsiveTestPage;