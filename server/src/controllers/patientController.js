import Patient from '../models/Patient.js';
import Invoice from '../models/Invoice.js';
import { validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';

/**
 * Generate unique patient ID
 * @param {string} labId - Laboratory ID
 * @returns {string} Unique patient ID
 */
const generatePatientId = async (labId) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAT${timestamp}${random}`;
};

/**
 * Generate unique sample barcode
 * @returns {string} Unique sample barcode
 */
const generateSampleBarcode = async () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SAMPLE${timestamp}${random}`;
};

/**
 * @route   POST /api/patients/register
 * @desc    Register a new patient with comprehensive data validation
 * @access  Private (Lab Admin, Staff with patient registration permission)
 * @body    {Object} Patient registration data including personal, medical, payment, and collection information
 * @returns {Object} Success response with patient and invoice data
 * 
 * @example
 * POST /api/patients/register
 * Content-Type: application/json
 * Authorization: Bearer <jwt_token>
 * 
 * {
 *   "name": "John Doe",
 *   "phone": "+1234567890",
 *   "email": "john.doe@example.com",
 *   "age": 30,
 *   "gender": "Male",
 *   "address": {
 *     "street": "123 Main St",
 *     "city": "New York",
 *     "state": "NY",
 *     "zip": "10001",
 *     "country": "USA"
 *   },
 *   "selectedTests": [
 *     {
 *       "id": "test1",
 *       "name": "Blood Test",
 *       "price": 50.00
 *     }
 *   ],
 *   "totalAmount": 50.00,
 *   "paymentType": "Cash"
 * }
 * 
 * @response 201 - Patient registered successfully
 * {
 *   "success": true,
 *   "message": "Patient registered successfully",
 *   "data": {
 *     "patient": { ... },
 *     "invoice": { ... }
 *   }
 * }
 * 
 * @response 400 - Validation error
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "errors": [
 *     {
 *       "field": "name",
 *       "message": "Patient name is required"
 *     }
 *   ]
 * }
 * 
 * @response 500 - Server error
 * {
 *   "success": false,
 *   "message": "Failed to register patient",
 *   "error": "Database connection error"
 * }
 */
export const registerPatient = asyncHandler(async (req, res) => {
  // Validate request data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }

  const {
    name,
    email,
    phone,
    age,
    gender,
    dateOfBirth,
    bloodGroup,
    address,
    allergies,
    medicalHistory,
    referringDoctor,
    patientCategory,
    totalAmount,
    discount,
    paymentType,
    finalAmount,
    collectionType,
    assignedTechnician,
    collectionDate,
    smsNotification,
    emailNotification,
    whatsappNotification,
    vipStatus,
    urgentReport,
    notes,
    reportDeliveryDate,
    selectedTests
  } = req.body;

  // Get labId from authenticated user or request params
  const labId = req.user?.labId || req.body.labId;
  
  if (!labId) {
    return res.status(400).json({
      success: false,
      message: 'Lab ID is required. Please ensure you are properly authenticated.',
      code: 'MISSING_LAB_ID'
    });
  }

  try {
    // Check for duplicate phone number within the same lab
    const existingPatient = await Patient.findOne({ phone, labId });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'A patient with this phone number already exists in your lab',
        code: 'DUPLICATE_PHONE',
        data: {
          existingPatientId: existingPatient.patientId,
          existingPatientName: existingPatient.name
        }
      });
    }

    // Check for duplicate email if provided
    if (email) {
      const existingEmailPatient = await Patient.findOne({ email, labId });
      if (existingEmailPatient) {
        return res.status(409).json({
          success: false,
          message: 'A patient with this email address already exists in your lab',
          code: 'DUPLICATE_EMAIL',
          data: {
            existingPatientId: existingEmailPatient.patientId,
            existingPatientName: existingEmailPatient.name
          }
        });
      }
    }

    // Generate unique IDs
    const patientId = await generatePatientId(labId);
    const sampleBarcode = await generateSampleBarcode();

    // Calculate final amount if not provided
    const calculatedFinalAmount = finalAmount || (totalAmount || 0) - (discount || 0);

    // Create patient data with proper data types and defaults
    const patientData = {
      patientId,
      name: name.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone.replace(/\D/g, ''), // Store only digits
      age,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      bloodGroup,
      address: address ? {
        street: address.street?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        zip: address.zip?.trim(),
        country: address.country?.trim() || 'India'
      } : undefined,
      allergies: allergies?.trim(),
      medicalHistory: medicalHistory?.trim(),
      referringDoctor: referringDoctor?.trim(),
      patientCategory: patientCategory || 'OPD',
      totalAmount: totalAmount || 0,
      discount: discount || 0,
      paymentType: paymentType || 'Cash',
      finalAmount: calculatedFinalAmount,
      collectionType: collectionType || 'In-lab',
      assignedTechnician: assignedTechnician?.trim(),
      collectionDate: collectionDate ? new Date(collectionDate) : undefined,
      smsNotification: smsNotification !== false,
      emailNotification: emailNotification !== false,
      whatsappNotification: whatsappNotification === true,
      vipStatus: vipStatus === true,
      urgentReport: urgentReport === true,
      notes: notes?.trim(),
      reportDeliveryDate: reportDeliveryDate ? new Date(reportDeliveryDate) : undefined,
      sampleBarcode,
      selectedTests: selectedTests || [],
      status: 'active',
      labId
    };

    // Create patient
    const patient = new Patient(patientData);
    await patient.save();

    // Create invoice if tests are selected
    let invoice = null;
    if (selectedTests && selectedTests.length > 0) {
      const invoiceData = {
        labId,
        patientId: patient._id,
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        invoiceId: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: selectedTests.map(test => ({
          testCode: test.id,
          testName: test.name.trim(),
          category: 'other', // Default category
          unitPrice: parseFloat(test.price),
          quantity: 1,
          totalAmount: parseFloat(test.price)
        })),
        subtotal: totalAmount || 0,
        totalAmount: calculatedFinalAmount,
        customerInfo: {
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          email: email?.trim()
        },
        generatedBy: req.user?._id || req.user?.id,
        status: 'draft', // Use valid enum value
        paymentStatus: paymentType === 'Pending' ? 'unpaid' : 'paid'
      };

      invoice = new Invoice(invoiceData);
      await invoice.save();
    }

    // Prepare comprehensive response data
    const responseData = {
      patient: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        patientCategory: patient.patientCategory,
        collectionType: patient.collectionType,
        vipStatus: patient.vipStatus,
        urgentReport: patient.urgentReport,
        status: patient.status,
        sampleBarcode: patient.sampleBarcode,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt
      }
    };

    if (invoice) {
      responseData.invoice = {
        _id: invoice._id,
        invoiceId: invoice.invoiceId,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        tests: invoice.tests,
        totalAmount: invoice.totalAmount,
        discount: invoice.discount,
        finalAmount: invoice.finalAmount,
        paymentType: invoice.paymentType,
        status: invoice.status,
        createdAt: invoice.createdAt
      };
    }

    // Log successful registration for audit purposes
    console.log(`Patient registered successfully: ${patient.patientId} for lab: ${labId}`);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: responseData,
      meta: {
        timestamp: new Date().toISOString(),
        labId: labId,
        registeredBy: req.user?.email || 'system'
      }
    });

  } catch (error) {
    console.error('Patient registration error:', error);
    
    // Handle specific database errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'patientId' ? 'Patient ID' : 
                       field === 'sampleBarcode' ? 'Sample Barcode' : 
                       field.charAt(0).toUpperCase() + field.slice(1);
      
      return res.status(409).json({
        success: false,
        message: `${fieldName} already exists. Please try again.`,
        code: 'DUPLICATE_KEY_ERROR',
        field: field
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Patient data validation failed',
        code: 'VALIDATION_ERROR',
        errors: validationErrors
      });
    }

    // Handle general server errors
    res.status(500).json({
      success: false,
      message: 'Failed to register patient. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/patients
 * @desc    Get all patients for a lab with pagination, search, and filtering
 * @access  Private (Lab Admin, Staff with patient view permission)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Number of patients per page (default: 10, max: 100)
 * @query   {string} search - Search term for name, email, phone, or patient ID
 * @query   {string} status - Filter by patient status (active, inactive)
 * @query   {string} category - Filter by patient category (OPD, IPD, Emergency)
 * @query   {string} sortBy - Sort field (name, createdAt, age) (default: createdAt)
 * @query   {string} sortOrder - Sort order (asc, desc) (default: desc)
 * @returns {Object} Success response with patients list and pagination info
 * 
 * @example
 * GET /api/patients?page=1&limit=10&search=john&status=active&category=OPD&sortBy=name&sortOrder=asc
 * Authorization: Bearer <jwt_token>
 * 
 * @response 200 - Patients retrieved successfully
 * {
 *   "success": true,
 *   "message": "Patients retrieved successfully",
 *   "data": {
 *     "patients": [...],
 *     "pagination": {
 *       "current": 1,
 *       "total": 5,
 *       "totalPages": 1,
 *       "hasNext": false,
 *       "hasPrev": false
 *     },
 *     "filters": {
 *       "search": "john",
 *       "status": "active",
 *       "category": "OPD"
 *     }
 *   }
 * }
 * 
 * @response 400 - Missing lab ID
 * {
 *   "success": false,
 *   "message": "Lab ID is required",
 *   "code": "MISSING_LAB_ID"
 * }
 */
export const getAllPatients = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    category, 
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;
  
  const labId = req.user?.labId || req.params.labId;
  
  if (!labId) {
    return res.status(400).json({
      success: false,
      message: 'Lab ID is required. Please ensure you are properly authenticated.',
      code: 'MISSING_LAB_ID'
    });
  }

  // Validate and sanitize pagination parameters
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 patients per page

  // Build query object
  const query = { labId };

  // Add search functionality across multiple fields
  if (search && search.trim()) {
    const searchTerm = search.trim();
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } },
      { patientId: { $regex: searchTerm, $options: 'i' } },
      { referringDoctor: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  // Filter by status
  if (status && ['active', 'inactive'].includes(status)) {
    query.status = status;
  }

  // Filter by category
  if (category && ['OPD', 'IPD', 'Emergency'].includes(category)) {
    query.patientCategory = category;
  }

  // Build sort object
  const validSortFields = ['name', 'createdAt', 'age', 'patientId'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortObj = { [sortField]: sortDirection };

  try {
    // Execute query with pagination
    const patients = await Patient.find(query)
      .select('patientId name email phone age gender patientCategory status vipStatus urgentReport sampleBarcode createdAt updatedAt')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort(sortObj)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await Patient.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    // Prepare pagination info
    const pagination = {
      current: pageNum,
      total: total,
      totalPages: totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
      limit: limitNum
    };

    // Prepare filters info for frontend
    const appliedFilters = {};
    if (search) appliedFilters.search = search;
    if (status) appliedFilters.status = status;
    if (category) appliedFilters.category = category;
    if (sortBy !== 'createdAt') appliedFilters.sortBy = sortBy;
    if (sortOrder !== 'desc') appliedFilters.sortOrder = sortOrder;

    res.status(200).json({
      success: true,
      message: `${total} patient${total !== 1 ? 's' : ''} retrieved successfully`,
      data: {
        patients,
        pagination,
        filters: appliedFilters
      },
      meta: {
        timestamp: new Date().toISOString(),
        labId: labId,
        requestedBy: req.user?.email || 'system'
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patients. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/patients/:patientId
 * @desc    Get a specific patient by ID or patient ID
 * @access  Private (Lab Admin, Staff with patient view permission)
 * @param   {string} patientId - Patient's database ID or generated patient ID
 * @returns {Object} Success response with patient data
 * 
 * @example
 * GET /api/patients/PAT123456789
 * Authorization: Bearer <jwt_token>
 * 
 * @response 200 - Patient retrieved successfully
 * {
 *   "success": true,
 *   "message": "Patient retrieved successfully",
 *   "data": {
 *     "_id": "...",
 *     "patientId": "PAT123456789",
 *     "name": "John Doe",
 *     "email": "john.doe@example.com",
 *     ...
 *   }
 * }
 * 
 * @response 404 - Patient not found
 * {
 *   "success": false,
 *   "message": "Patient not found in your lab",
 *   "code": "PATIENT_NOT_FOUND"
 * }
 */
export const getPatientById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labId = req.user?.labId || req.query.labId;
  
  if (!labId) {
    return res.status(400).json({
      success: false,
      message: 'Lab ID is required. Please ensure you are properly authenticated.',
      code: 'MISSING_LAB_ID'
    });
  }

  // Validate patientId parameter
  if (!patientId || patientId.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Patient ID is required',
      code: 'MISSING_PATIENT_ID'
    });
  }

  try {
    const patient = await Patient.findOne({ 
      $or: [
        { _id: patientId, labId },
        { patientId: patientId, labId }
      ]
    }).lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found in your lab',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient retrieved successfully',
      data: patient,
      meta: {
        timestamp: new Date().toISOString(),
        labId: labId,
        requestedBy: req.user?.email || 'system'
      }
    });

  } catch (error) {
    console.error('Get patient by ID error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
        code: 'INVALID_PATIENT_ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update patient
export const updatePatient = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { patientId } = req.params;
  const labId = req.user?.labId || req.body.labId;
  const updateData = req.body;

  // Remove fields that shouldn't be updated directly
  delete updateData.patientId;
  delete updateData.labId;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  try {
    const patient = await Patient.findOneAndUpdate(
      { 
        $or: [
          { _id: patientId, labId },
          { patientId: patientId, labId }
        ]
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient',
      error: error.message
    });
  }
});

// Delete patient
export const deletePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labId = req.user?.labId || req.query.labId;

  if (!labId) {
    return res.status(400).json({
      success: false,
      message: 'Lab ID is required'
    });
  }

  try {
    const patient = await Patient.findOneAndDelete({ 
      $or: [
        { _id: patientId, labId },
        { patientId: patientId, labId }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message
    });
  }
});

// Search patients
export const searchPatients = asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;
  const labId = req.user?.labId || req.query.labId;

  if (!labId) {
    return res.status(400).json({
      success: false,
      message: 'Lab ID is required'
    });
  }

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  try {
    const patients = await Patient.find({
      labId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { patientId: { $regex: query, $options: 'i' } }
      ]
    })
    .select('patientId name email phone age gender status')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Patients found successfully',
      data: patients
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: error.message
    });
  }
});

// Get patient statistics
export const getPatientStats = asyncHandler(async (req, res) => {
  const labId = req.user?.labId || req.query.labId;

  if (!labId) {
    return res.status(400).json({
      success: false,
      message: 'Lab ID is required'
    });
  }

  try {
    const stats = await Patient.aggregate([
      { $match: { labId } },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          vipPatients: {
            $sum: { $cond: [{ $eq: ['$vipStatus', true] }, 1, 0] }
          },
          newPatientsThisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                },
                1,
                0
              ]
            }
          },
          categoryBreakdown: {
            $push: '$patientCategory'
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalPatients: 0,
      activePatients: 0,
      vipPatients: 0,
      newPatientsThisMonth: 0,
      categoryBreakdown: []
    };

    // Process category breakdown
    const categoryStats = {};
    result.categoryBreakdown.forEach(category => {
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    result.categoryBreakdown = categoryStats;

    res.json({
      success: true,
      message: 'Patient statistics retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient statistics',
      error: error.message
    });
  }
});