import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { 
  Upload, 
  Download, 
  Package, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  FileText,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const BulkActions = ({ 
  selectedTests = [], 
  onBulkDelete, 
  onBulkStatusToggle, 
  onExport, 
  onImport,
  onCreatePackage,
  isLoading = false 
}) => {
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [showImportResults, setShowImportResults] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['text/csv', 'application/json'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !['csv', 'json'].includes(fileExtension)) {
        alert("Invalid File Type: Please select a CSV or JSON file.");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File Too Large: File size must be less than 5MB.");
        return;
      }

      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert("No File Selected: Please select a file to import.");
      return;
    }

    try {
      const results = await onImport(importFile);
      setImportResults(results);
      setShowImportResults(true);
      setImportFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('import-file-input');
      if (fileInput) fileInput.value = '';

      alert(`Import Completed: ${results.successCount} tests imported successfully.`);
    } catch (error) {
      alert(`Import Failed: ${error.message || "Failed to import tests."}`);
    }
  };

  const handleBulkAction = async (action, actionName) => {
    if (selectedTests.length === 0) {
      alert(`No Tests Selected: Please select tests to ${actionName.toLowerCase()}.`);
      return;
    }

    try {
      await action(selectedTests);
      alert(`Success: ${selectedTests.length} tests ${actionName.toLowerCase()} successfully.`);
    } catch (error) {
      alert(`${actionName} Failed: ${error.message || `Failed to ${actionName.toLowerCase()} tests.`}`);
    }
  };

  const ImportResultsModal = () => {
    if (!showImportResults || !importResults) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Import Results
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportResults(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResults.totalProcessed}
                </div>
                <div className="text-sm text-gray-600">Total Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResults.successCount}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResults.errorCount}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Successful Imports */}
            {importResults.results && importResults.results.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Successfully Imported Tests
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResults.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="font-medium">{result.testCode}</span>
                      <span className="text-sm text-gray-600">{result.testName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {importResults.errors && importResults.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Import Errors
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded">
                      <div className="font-medium text-red-700">Row {error.row}</div>
                      <div className="text-sm text-red-600">{error.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Actions
            {selectedTests.length > 0 && (
              <Badge variant="secondary">{selectedTests.length} selected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import/Export Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Import & Export</h4>
            <div className="flex flex-wrap gap-2">
              {/* Import */}
              <div className="flex items-center gap-2">
                <input
                  id="import-file-input"
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-file-input').click()}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
                {importFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{importFile.name}</span>
                    <Button
                      size="sm"
                      onClick={handleImport}
                      disabled={isLoading}
                    >
                      Import
                    </Button>
                  </div>
                )}
              </div>

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('csv')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('json')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Bulk Operations Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Bulk Operations</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(onBulkStatusToggle, 'Toggle Status')}
                disabled={isLoading || selectedTests.length === 0}
              >
                <ToggleLeft className="h-4 w-4 mr-2" />
                Toggle Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(onBulkDelete, 'Delete')}
                disabled={isLoading || selectedTests.length === 0}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              {onCreatePackage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onCreatePackage, 'Create Package')}
                  disabled={isLoading || selectedTests.length === 0}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Import: Upload CSV or JSON files (max 5MB)</p>
            <p>• Export: Download test data in CSV or JSON format</p>
            <p>• Bulk operations require test selection</p>
          </div>
        </CardContent>
      </Card>

      <ImportResultsModal />
    </>
  );
};

export default BulkActions;