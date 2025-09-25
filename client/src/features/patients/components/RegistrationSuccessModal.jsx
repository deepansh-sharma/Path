import React from 'react';
import { CheckCircle, Printer, Download, Send, X } from 'lucide-react';

const RegistrationSuccessModal = ({ 
  isOpen, 
  onClose, 
  patientData, 
  invoiceData,
  onPrintInvoice,
  onDownloadInvoice,
  onSendInvoice 
}) => {
  if (!isOpen) return null;

  const handlePrintInvoice = () => {
    if (onPrintInvoice) {
      onPrintInvoice(invoiceData);
    }
    // Simulate print functionality
    window.print();
  };

  const handleDownloadInvoice = () => {
    if (onDownloadInvoice) {
      onDownloadInvoice(invoiceData);
    }
    // Simulate download
    console.log('Downloading invoice:', invoiceData.invoiceId);
  };

  const handleSendInvoice = () => {
    if (onSendInvoice) {
      onSendInvoice(invoiceData);
    }
    // Simulate sending via SMS/Email
    alert(`Invoice sent to ${patientData.phone} and ${patientData.email}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Registration Successful!
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Patient Details */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Patient Registered</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><span className="font-medium">Name:</span> {patientData?.name}</p>
                <p><span className="font-medium">Patient ID:</span> {patientData?.patientId}</p>
                <p><span className="font-medium">Phone:</span> {patientData?.phone}</p>
              </div>
            </div>

            {/* Invoice Details */}
            {invoiceData && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Invoice Generated</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><span className="font-medium">Invoice ID:</span> {invoiceData.invoiceId}</p>
                  <p><span className="font-medium">Amount:</span> ₹{invoiceData.finalAmount}</p>
                  <p><span className="font-medium">Payment:</span> {invoiceData.paymentType}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                      {invoiceData.status}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="text-center py-2">
              <p className="text-gray-600">
                Patient has been successfully registered and invoice has been automatically generated.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePrintInvoice}
                className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </button>
              
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              
              <button
                onClick={handleSendInvoice}
                className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;