import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, 
  FiFile, 
  FiImage, 
  FiX, 
  FiCheck,
  FiAlertCircle,
  FiDownload,
  FiEye
} from 'react-icons/fi';

const FileUpload = ({
  onUpload,
  onRemove,
  accept = "*/*",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  showPreview = true,
  showProgress = true,
  disabled = false,
  className = "",
  dragText = "Drag and drop files here",
  browseText = "or click to browse",
  uploadText = "Upload Files",
  removeText = "Remove",
  previewText = "Preview",
  downloadText = "Download",
  files = [],
  loading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${formatFileSize(maxSize)}`);
    }

    // Check file type
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return type === fileExtension;
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      if (!isValidType) {
        errors.push(`File type not supported. Accepted: ${accept}`);
      }
    }

    return errors;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return FiImage;
    }
    return FiFile;
  };

  // Handle file selection
  const handleFiles = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    // Check max files limit
    if (!multiple && fileArray.length > 1) {
      setErrors({ general: 'Only one file is allowed' });
      return;
    }

    if (multiple && files.length + fileArray.length > maxFiles) {
      setErrors({ general: `Maximum ${maxFiles} files allowed` });
      return;
    }

    // Validate each file
    const validFiles = [];
    const fileErrors = {};

    fileArray.forEach((file, index) => {
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        fileErrors[`file_${index}`] = validationErrors[0];
      } else {
        validFiles.push(file);
      }
    });

    setErrors(fileErrors);

    // Process valid files
    if (validFiles.length > 0) {
      validFiles.forEach((file) => {
        const fileId = `${file.name}_${Date.now()}_${Math.random()}`;
        
        // Simulate upload progress
        if (showProgress) {
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
          
          const interval = setInterval(() => {
            setUploadProgress(prev => {
              const currentProgress = prev[fileId] || 0;
              if (currentProgress >= 100) {
                clearInterval(interval);
                return prev;
              }
              return { ...prev, [fileId]: currentProgress + 10 };
            });
          }, 100);
        }

        // Call upload handler
        onUpload?.({
          ...file,
          id: fileId,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      });
    }
  }, [files.length, maxFiles, multiple, onUpload, showProgress, maxSize, accept]);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  // File input change handler
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Open file browser
  const openFileExplorer = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove file
  const handleRemove = (file) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[file.id];
      return newProgress;
    });
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[file.id];
      return newErrors;
    });

    onRemove?.(file);
  };

  // Preview file
  const handlePreview = (file) => {
    if (file.preview) {
      window.open(file.preview, '_blank');
    } else if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  // Download file
  const handleDownload = (file) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileExplorer}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <motion.div
          animate={{ scale: dragActive ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
            dragActive ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <FiUpload className={`w-6 h-6 ${
              dragActive ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {dragText}
            </p>
            <p className="text-sm text-gray-500">
              {browseText}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max size: {formatFileSize(maxSize)}
              {multiple && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div className="space-y-2">
          {Object.entries(errors).map(([key, error]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-600 text-sm"
            >
              <FiAlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({files.length})
          </h4>
          
          <AnimatePresence>
            {files.map((file) => {
              const FileIcon = getFileIcon(file);
              const progress = uploadProgress[file.id];
              const isUploading = progress !== undefined && progress < 100;
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {showPreview && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {showProgress && isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <motion.div
                            className="bg-blue-600 h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {progress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {showPreview && (file.preview || file.url) && (
                      <button
                        onClick={() => handlePreview(file)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title={previewText}
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {file.url && (
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title={downloadText}
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemove(file)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title={removeText}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    
                    {!isUploading && (
                      <FiCheck className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FileUpload;