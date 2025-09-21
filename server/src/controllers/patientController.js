const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// Get all patients for a lab
exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const labId = req.user.lab || req.params.labId;
    
    const query = { lab: labId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const patients = await Patient.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      message: 'Patients retrieved successfully',
      data: {
        patients,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patients',
      error: error.message
    });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const labId = req.user.lab || req.params.labId;
    
    const patient = await Patient.findOne({ _id: patientId, lab: labId })
      .populate('reports')
      .populate('invoices');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient retrieved successfully',
      data: patient
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient',
      error: error.message
    });
  }
};

// Create new patient
exports.createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const labId = req.user.lab || req.params.labId;
    const patientData = { ...req.body, lab: labId };

    // Generate patient ID if not provided
    if (!patientData.patientId) {
      const lastPatient = await Patient.findOne({ lab: labId }).sort({ createdAt: -1 });
      const nextNumber = lastPatient ? parseInt(lastPatient.patientId.split('-')[1]) + 1 : 1;
      patientData.patientId = `PAT-${nextNumber.toString().padStart(4, '0')}`;
    }

    const patient = new Patient(patientData);
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create patient',
      error: error.message
    });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { patientId } = req.params;
    const labId = req.user.lab || req.params.labId;
    const updateData = req.body;

    const patient = await Patient.findOneAndUpdate(
      { _id: patientId, lab: labId },
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
};

// Delete patient
exports.deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const labId = req.user.lab || req.params.labId;

    const patient = await Patient.findOneAndDelete({ _id: patientId, lab: labId });

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
};

// Get patient medical history
exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const labId = req.user.lab || req.params.labId;
    
    const patient = await Patient.findOne({ _id: patientId, lab: labId })
      .select('medicalHistory')
      .populate('medicalHistory.reports');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient history retrieved successfully',
      data: patient.medicalHistory || []
    });
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient history',
      error: error.message
    });
  }
};

// Add medical history entry
exports.addHistoryEntry = async (req, res) => {
  try {
    const { patientId } = req.params;
    const labId = req.user.lab || req.params.labId;
    const historyData = req.body;

    const patient = await Patient.findOneAndUpdate(
      { _id: patientId, lab: labId },
      { $push: { medicalHistory: historyData } },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical history entry added successfully',
      data: patient.medicalHistory
    });
  } catch (error) {
    console.error('Add history entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medical history entry',
      error: error.message
    });
  }
};

// Search patients
exports.searchPatients = async (req, res) => {
  try {
    const { q: query } = req.query;
    const labId = req.user.lab || req.params.labId;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const patients = await Patient.find({
      lab: labId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { patientId: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

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
};

// Get patient statistics
exports.getPatientStats = async (req, res) => {
  try {
    const labId = req.user.lab || req.params.labId;

    const stats = await Patient.aggregate([
      { $match: { lab: labId } },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
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
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Patient statistics retrieved successfully',
      data: stats[0] || {
        totalPatients: 0,
        activePatients: 0,
        newPatientsThisMonth: 0
      }
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient statistics',
      error: error.message
    });
  }
};