/**
 * @fileoverview Comprehensive validation utilities for form inputs
 * @description Client-side validation functions for patient registration and other forms
 * @version 1.0.0
 * @author Pathology SaaS Team
 */

/**
 * Email validation using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, message: 'Email address is too long' };
  }

  return { isValid: true, message: '' };
};

/**
 * Phone number validation for Indian mobile numbers
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, message: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Check for Indian mobile number patterns
  const indianMobileRegex = /^[6-9]\d{9}$/;
  const internationalRegex = /^(\+91|91)?[6-9]\d{9}$/;

  if (cleanPhone.length < 10) {
    return { isValid: false, message: 'Phone number must be at least 10 digits' };
  }

  if (cleanPhone.length > 13) {
    return { isValid: false, message: 'Phone number is too long' };
  }

  // Check for Indian mobile pattern
  if (cleanPhone.length === 10 && !indianMobileRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter a valid Indian mobile number' };
  }

  // Check for international format
  if (cleanPhone.length > 10 && !internationalRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }

  return { isValid: true, message: '' };
};

/**
 * Name validation with comprehensive checks
 * @param {string} name - Name to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, message: 'Name is too long (maximum 100 characters)' };
  }

  // Allow letters, spaces, hyphens, apostrophes, and dots
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, apostrophes, and dots' };
  }

  // Check for consecutive spaces or special characters
  if (/\s{2,}/.test(trimmedName) || /[-'.]{2,}/.test(trimmedName)) {
    return { isValid: false, message: 'Name cannot contain consecutive spaces or special characters' };
  }

  return { isValid: true, message: '' };
};

/**
 * Age validation with reasonable limits
 * @param {string|number} age - Age to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateAge = (age) => {
  if (!age && age !== 0) {
    return { isValid: false, message: 'Age is required' };
  }

  const numericAge = parseInt(age, 10);

  if (isNaN(numericAge)) {
    return { isValid: false, message: 'Age must be a valid number' };
  }

  if (numericAge < 0) {
    return { isValid: false, message: 'Age cannot be negative' };
  }

  if (numericAge > 150) {
    return { isValid: false, message: 'Please enter a valid age (maximum 150 years)' };
  }

  return { isValid: true, message: '' };
};

/**
 * Date of birth validation
 * @param {string} dateOfBirth - Date of birth to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return { isValid: false, message: 'Date of birth is required' };
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }

  if (birthDate > today) {
    return { isValid: false, message: 'Date of birth cannot be in the future' };
  }

  // Check if the person is older than 150 years
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 150);

  if (birthDate < maxAge) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }

  return { isValid: true, message: '' };
};

/**
 * Address validation
 * @param {Object} address - Address object to validate
 * @returns {Object} Validation result with isValid, message, and field-specific errors
 */
export const validateAddress = (address) => {
  const errors = {};
  let isValid = true;

  if (!address) {
    return { isValid: false, message: 'Address is required', errors: {} };
  }

  // City validation
  if (!address.city || !address.city.trim()) {
    errors.city = 'City is required';
    isValid = false;
  } else if (address.city.trim().length < 2) {
    errors.city = 'City name must be at least 2 characters';
    isValid = false;
  } else if (address.city.trim().length > 50) {
    errors.city = 'City name is too long (maximum 50 characters)';
    isValid = false;
  }

  // State validation
  if (!address.state || !address.state.trim()) {
    errors.state = 'State is required';
    isValid = false;
  } else if (address.state.trim().length < 2) {
    errors.state = 'State name must be at least 2 characters';
    isValid = false;
  } else if (address.state.trim().length > 50) {
    errors.state = 'State name is too long (maximum 50 characters)';
    isValid = false;
  }

  // ZIP code validation (optional but if provided, should be valid)
  if (address.zip && address.zip.trim()) {
    const zipRegex = /^\d{6}$/; // Indian PIN code format
    if (!zipRegex.test(address.zip.trim())) {
      errors.zip = 'Please enter a valid 6-digit PIN code';
      isValid = false;
    }
  }

  // Street validation (optional but if provided, should be reasonable)
  if (address.street && address.street.trim().length > 200) {
    errors.street = 'Street address is too long (maximum 200 characters)';
    isValid = false;
  }

  return {
    isValid,
    message: isValid ? '' : 'Please fix the address errors',
    errors
  };
};

/**
 * Blood group validation
 * @param {string} bloodGroup - Blood group to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateBloodGroup = (bloodGroup) => {
  if (!bloodGroup) {
    return { isValid: true, message: '' }; // Blood group is optional
  }

  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  if (!validBloodGroups.includes(bloodGroup)) {
    return { isValid: false, message: 'Please select a valid blood group' };
  }

  return { isValid: true, message: '' };
};

/**
 * Payment amount validation
 * @param {string|number} amount - Amount to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateAmount = (amount) => {
  if (!amount && amount !== 0) {
    return { isValid: false, message: 'Amount is required' };
  }

  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount)) {
    return { isValid: false, message: 'Amount must be a valid number' };
  }

  if (numericAmount < 0) {
    return { isValid: false, message: 'Amount cannot be negative' };
  }

  if (numericAmount > 1000000) {
    return { isValid: false, message: 'Amount is too large (maximum ₹10,00,000)' };
  }

  return { isValid: true, message: '' };
};

/**
 * Discount validation
 * @param {string|number} discount - Discount percentage to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateDiscount = (discount) => {
  if (!discount && discount !== 0) {
    return { isValid: true, message: '' }; // Discount is optional
  }

  const numericDiscount = parseFloat(discount);

  if (isNaN(numericDiscount)) {
    return { isValid: false, message: 'Discount must be a valid number' };
  }

  if (numericDiscount < 0) {
    return { isValid: false, message: 'Discount cannot be negative' };
  }

  if (numericDiscount > 100) {
    return { isValid: false, message: 'Discount cannot exceed 100%' };
  }

  return { isValid: true, message: '' };
};

/**
 * Collection date validation
 * @param {string} collectionDate - Collection date to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateCollectionDate = (collectionDate) => {
  if (!collectionDate) {
    return { isValid: false, message: 'Collection date is required' };
  }

  const collection = new Date(collectionDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  if (isNaN(collection.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }

  if (collection < today) {
    return { isValid: false, message: 'Collection date cannot be in the past' };
  }

  // Check if collection date is more than 30 days in the future
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  if (collection > maxDate) {
    return { isValid: false, message: 'Collection date cannot be more than 30 days in the future' };
  }

  return { isValid: true, message: '' };
};

/**
 * Selected tests validation
 * @param {Array} selectedTests - Array of selected test IDs
 * @returns {Object} Validation result with isValid and message
 */
export const validateSelectedTests = (selectedTests) => {
  if (!selectedTests || !Array.isArray(selectedTests)) {
    return { isValid: false, message: 'Please select at least one test' };
  }

  if (selectedTests.length === 0) {
    return { isValid: false, message: 'Please select at least one test' };
  }

  if (selectedTests.length > 20) {
    return { isValid: false, message: 'Cannot select more than 20 tests at once' };
  }

  return { isValid: true, message: '' };
};

/**
 * Comprehensive patient form validation
 * @param {Object} formData - Complete form data object
 * @param {Array} selectedTests - Array of selected tests
 * @param {number} currentStep - Current form step (0-based)
 * @returns {Object} Validation result with isValid, errors object, and overall message
 */
export const validatePatientForm = (formData, selectedTests, currentStep) => {
  const errors = {};
  let isValid = true;

  // Step 0: Basic Information
  if (currentStep >= 0) {
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message;
      isValid = false;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
      isValid = false;
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
      isValid = false;
    }

    const ageValidation = validateAge(formData.age);
    if (!ageValidation.isValid) {
      errors.age = ageValidation.message;
      isValid = false;
    }

    if (formData.dateOfBirth) {
      const dobValidation = validateDateOfBirth(formData.dateOfBirth);
      if (!dobValidation.isValid) {
        errors.dateOfBirth = dobValidation.message;
        isValid = false;
      }
    }

    if (formData.bloodGroup) {
      const bloodGroupValidation = validateBloodGroup(formData.bloodGroup);
      if (!bloodGroupValidation.isValid) {
        errors.bloodGroup = bloodGroupValidation.message;
        isValid = false;
      }
    }
  }

  // Step 1: Address & Medical
  if (currentStep >= 1) {
    const addressValidation = validateAddress(formData.address);
    if (!addressValidation.isValid) {
      Object.assign(errors, addressValidation.errors);
      isValid = false;
    }
  }

  // Step 2: Tests & Payment
  if (currentStep >= 2) {
    const testsValidation = validateSelectedTests(selectedTests);
    if (!testsValidation.isValid) {
      errors.selectedTests = testsValidation.message;
      isValid = false;
    }

    const amountValidation = validateAmount(formData.totalAmount);
    if (!amountValidation.isValid) {
      errors.totalAmount = amountValidation.message;
      isValid = false;
    }

    if (formData.discount) {
      const discountValidation = validateDiscount(formData.discount);
      if (!discountValidation.isValid) {
        errors.discount = discountValidation.message;
        isValid = false;
      }
    }
  }

  // Step 3: Collection & Final
  if (currentStep >= 3) {
    if (formData.collectionDate) {
      const collectionDateValidation = validateCollectionDate(formData.collectionDate);
      if (!collectionDateValidation.isValid) {
        errors.collectionDate = collectionDateValidation.message;
        isValid = false;
      }
    }
  }

  return {
    isValid,
    errors,
    message: isValid ? 'All validations passed' : 'Please fix the validation errors'
  };
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateAge,
  validateDateOfBirth,
  validateAddress,
  validateBloodGroup,
  validateAmount,
  validateDiscount,
  validateCollectionDate,
  validateSelectedTests,
  validatePatientForm
};