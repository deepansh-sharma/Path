const Sample = require('../models/Sample');
const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');
const barcodeGenerator = require('../utils/barcodeGenerator');

// Get all samples for a lab
exports.getAllSamples = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId, testType } = req.query;
    const labId = req.user.lab || req.params.labId;
    
    const query = { lab: labId };

    if (status) {
      query.status = status;
    }

    if (patientId) {
      query.patient = patientId;
    }

    if (testType) {
      query.testType = testType;
    }

    const samples = await Sample.find(query)
      .populate('patient', 'name patientId email phone')
      .populate('collectedBy', 'name email')
      .populate('processedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Sample.countDocuments(query);

    res.json({
      success: true,
      message: 'Samples retrieved successfully',
      data: {
        samples,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all samples error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve samples',
      error: error.message
    });
  }
};

// Get sample by ID
exports.getSampleById = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const labId = req.user.lab || req.params.labId;
    
    const sample = await Sample.findOne({ _id: sampleId, lab: labId })
      .populate('patient', 'name patientId email phone age gender')
      .populate('collectedBy', 'name email')
      .populate('processedBy', 'name email')
      .populate('report', 'reportId status');

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample not found'
      });
    }

    res.json({
      success: true,
      message: 'Sample retrieved successfully',
      data: sample
    });
  } catch (error) {
    console.error('Get sample by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sample',
      error: error.message
    });
  }
};

// Create new sample
exports.createSample = async (req, res) => {
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
    const sampleData = { 
      ...req.body, 
      lab: labId,
      collectedBy: req.user.id,
      status: 'collected'
    };

    // Generate sample ID and barcode if not provided
    if (!sampleData.sampleId) {
      const lastSample = await Sample.findOne({ lab: labId }).sort({ createdAt: -1 });
      const nextNumber = lastSample ? parseInt(lastSample.sampleId.split('-')[1]) + 1 : 1;
      sampleData.sampleId = `SMP-${nextNumber.toString().padStart(6, '0')}`;
    }

    // Generate barcode
    sampleData.barcode = await barcodeGenerator.generateBarcode(sampleData.sampleId);

    const sample = new Sample(sampleData);
    await sample.save();

    // Populate the created sample
    await sample.populate('patient', 'name patientId email phone');
    await sample.populate('collectedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Sample created successfully',
      data: sample
    });
  } catch (error) {
    console.error('Create sample error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sample',
      error: error.message
    });
  }
};

// Update sample
exports.updateSample = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sampleId } = req.params;
    const labId = req.user.lab || req.params.labId;
    const updateData = req.body;

    const sample = await Sample.findOneAndUpdate(
      { _id: sampleId, lab: labId },
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'name patientId email phone')
     .populate('collectedBy', 'name email')
     .populate('processedBy', 'name email');

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample not found'
      });
    }

    res.json({
      success: true,
      message: 'Sample updated successfully',
      data: sample
    });
  } catch (error) {
    console.error('Update sample error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sample',
      error: error.message
    });
  }
};

// Delete sample
exports.deleteSample = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const labId = req.user.lab || req.params.labId;

    const sample = await Sample.findOneAndDelete({ _id: sampleId, lab: labId });

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample not found'
      });
    }

    res.json({
      success: true,
      message: 'Sample deleted successfully'
    });
  } catch (error) {
    console.error('Delete sample error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sample',
      error: error.message
    });
  }
};

// Update sample status
exports.updateSampleStatus = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const { status, notes } = req.body;
    const labId = req.user.lab || req.params.labId;

    const updateData = { 
      status,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    if (status === 'processing') {
      updateData.processedBy = req.user.id;
      updateData.processedAt = new Date();
    }

    if (notes) {
      updateData.$push = {
        statusHistory: {
          status,
          updatedBy: req.user.id,
          updatedAt: new Date(),
          notes
        }
      };
    }

    const sample = await Sample.findOneAndUpdate(
      { _id: sampleId, lab: labId },
      updateData,
      { new: true }
    ).populate('patient', 'name patientId')
     .populate('processedBy', 'name');

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample not found'
      });
    }

    res.json({
      success: true,
      message: 'Sample status updated successfully',
      data: sample
    });
  } catch (error) {
    console.error('Update sample status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sample status',
      error: error.message
    });
  }
};

// Search samples by barcode
exports.searchByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const labId = req.user.lab || req.params.labId;

    const sample = await Sample.findOne({ barcode, lab: labId })
      .populate('patient', 'name patientId email phone')
      .populate('collectedBy', 'name email')
      .populate('processedBy', 'name email');

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample not found with this barcode'
      });
    }

    res.json({
      success: true,
      message: 'Sample found successfully',
      data: sample
    });
  } catch (error) {
    console.error('Search by barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search sample by barcode',
      error: error.message
    });
  }
};

// Generate barcode for existing sample
exports.generateBarcode = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const labId = req.user.lab || req.params.labId;

    const sample = await Sample.findOne({ _id: sampleId, lab: labId });

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample not found'
      });
    }

    // Generate new barcode
    const barcode = await barcodeGenerator.generateBarcode(sample.sampleId);

    // Update sample with new barcode
    sample.barcode = barcode;
    await sample.save();

    res.json({
      success: true,
      message: 'Barcode generated successfully',
      data: {
        sampleId: sample.sampleId,
        barcode: barcode
      }
    });
  } catch (error) {
    console.error('Generate barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate barcode',
      error: error.message
    });
  }
};

// Get sample tracking history
exports.getSampleHistory = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const labId = req.user.lab || req.params.labId;

    const sample = await Sample.findOne({ _id: sampleId, lab: labId })
      .select('sampleId statusHistory')
      .populate('statusHistory.updatedBy', 'name');

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample not found'
      });
    }

    res.json({
      success: true,
      message: 'Sample history retrieved successfully',
      data: {
        sampleId: sample.sampleId,
        history: sample.statusHistory || []
      }
    });
  } catch (error) {
    console.error('Get sample history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sample history',
      error: error.message
    });
  }
};

// Search samples
exports.searchSamples = async (req, res) => {
  try {
    const { q: query } = req.query;
    const labId = req.user.lab || req.params.labId;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const samples = await Sample.find({
      lab: labId,
      $or: [
        { sampleId: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
        { testType: { $regex: query, $options: 'i' } }
      ]
    }).populate('patient', 'name patientId')
      .limit(20)
      .select('sampleId barcode testType status createdAt patient');

    res.json({
      success: true,
      message: 'Samples found successfully',
      data: samples
    });
  } catch (error) {
    console.error('Search samples error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search samples',
      error: error.message
    });
  }
};

// Get sample statistics
exports.getSampleStats = async (req, res) => {
  try {
    const labId = req.user.lab || req.params.labId;

    const stats = await Sample.aggregate([
      { $match: { lab: labId } },
      {
        $group: {
          _id: null,
          totalSamples: { $sum: 1 },
          collectedSamples: {
            $sum: { $cond: [{ $eq: ['$status', 'collected'] }, 1, 0] }
          },
          processingSamples: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          completedSamples: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          samplesThisMonth: {
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
      message: 'Sample statistics retrieved successfully',
      data: stats[0] || {
        totalSamples: 0,
        collectedSamples: 0,
        processingSamples: 0,
        completedSamples: 0,
        samplesThisMonth: 0
      }
    });
  } catch (error) {
    console.error('Get sample stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sample statistics',
      error: error.message
    });
  }
};