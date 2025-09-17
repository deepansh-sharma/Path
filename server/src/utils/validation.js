// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - at least 8 characters with uppercase, lowercase, number, and special character
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone validation - supports various formats
export const validatePhone = (phone) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return false;
  }
  
  // Basic phone regex - supports international formats
  const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

// Name validation
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100;
};

// MongoDB ObjectId validation
export const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Date validation
export const validateDate = (date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

// Age validation (for date of birth)
export const validateAge = (dateOfBirth, minAge = 0, maxAge = 150) => {
  if (!validateDate(dateOfBirth)) {
    return false;
  }
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

// Aadhar number validation (Indian ID)
export const validateAadhar = (aadhar) => {
  if (!aadhar || typeof aadhar !== 'string') {
    return false;
  }
  
  // Remove spaces and hyphens
  const cleanAadhar = aadhar.replace(/[\s-]/g, '');
  
  // Check if it's 12 digits
  if (!/^\d{12}$/.test(cleanAadhar)) {
    return false;
  }
  
  // Aadhar validation algorithm (Verhoeff algorithm)
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];
  
  let c = 0;
  const myArray = cleanAadhar.split('').reverse();
  
  for (let i = 0; i < myArray.length; i++) {
    c = d[c][p[((i + 1) % 8)][parseInt(myArray[i])]];
  }
  
  return c === 0;
};

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File extension validation
export const validateFileExtension = (filename, allowedExtensions) => {
  if (!filename || !allowedExtensions || !Array.isArray(allowedExtensions)) {
    return false;
  }
  
  const extension = filename.split('.').pop()?.toLowerCase();
  return allowedExtensions.includes(extension);
};

// File size validation (in bytes)
export const validateFileSize = (size, maxSize) => {
  return typeof size === 'number' && size > 0 && size <= maxSize;
};

// Barcode validation
export const validateBarcode = (barcode) => {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }
  
  // Remove spaces and convert to uppercase
  const cleanBarcode = barcode.replace(/\s/g, '').toUpperCase();
  
  // Check if it's alphanumeric and between 6-20 characters
  return /^[A-Z0-9]{6,20}$/.test(cleanBarcode);
};

// Test code validation
export const validateTestCode = (testCode) => {
  if (!testCode || typeof testCode !== 'string') {
    return false;
  }
  
  // Test codes should be alphanumeric, 2-10 characters
  return /^[A-Z0-9]{2,10}$/.test(testCode.toUpperCase());
};

// Amount validation (for invoices)
export const validateAmount = (amount) => {
  if (typeof amount !== 'number') {
    return false;
  }
  
  return amount >= 0 && amount <= 999999.99 && Number.isFinite(amount);
};

// Percentage validation
export const validatePercentage = (percentage) => {
  if (typeof percentage !== 'number') {
    return false;
  }
  
  return percentage >= 0 && percentage <= 100 && Number.isFinite(percentage);
};

// Gender validation
export const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
  return validGenders.includes(gender?.toLowerCase());
};

// Role validation
export const validateRole = (role) => {
  const validRoles = ['super_admin', 'lab_admin', 'lab_manager', 'technician', 'receptionist', 'staff'];
  return validRoles.includes(role);
};

// Status validation for various entities
export const validateStatus = (status, validStatuses) => {
  return Array.isArray(validStatuses) && validStatuses.includes(status);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate pagination parameters
export const validatePagination = (page, limit, maxLimit = 100) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  return {
    page: Math.max(1, pageNum),
    limit: Math.min(Math.max(1, limitNum), maxLimit)
  };
};

// Validate sort parameters
export const validateSort = (sort, allowedFields) => {
  if (!sort || typeof sort !== 'string') {
    return {};
  }
  
  const sortObj = {};
  const sortPairs = sort.split(',');
  
  for (const pair of sortPairs) {
    const [field, order] = pair.trim().split(':');
    
    if (allowedFields.includes(field)) {
      sortObj[field] = order === 'desc' ? -1 : 1;
    }
  }
  
  return sortObj;
};

// Comprehensive validation function
export const validateRequired = (data, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field} is required`);
    }
  }
  
  return errors;
};

// Export all validation functions
export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateObjectId,
  validateDate,
  validateAge,
  validateAadhar,
  validateUrl,
  validateFileExtension,
  validateFileSize,
  validateBarcode,
  validateTestCode,
  validateAmount,
  validatePercentage,
  validateGender,
  validateRole,
  validateStatus,
  sanitizeInput,
  validatePagination,
  validateSort,
  validateRequired
};