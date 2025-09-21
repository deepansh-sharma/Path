const Report = require('../models/Report');
const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// Get all reports for a lab
exports.getAllReports = async (req, res) => {
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

    const reports = await Report.find(query)
      .populate('patient', 'name patientId email phone')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      message: 'Reports retrieved successfully',
      data: {
        reports,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports',
      error: error.message
    });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const labId = req.user.lab || req.params.labId;
    
    const report = await Report.findOne({ _id: reportId, lab: labId })
      .populate('patient', 'name patientId email phone age gender')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report retrieved successfully',
      data: report
    });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
      error: error.message
    });
  }
};

// Create new report
exports.createReport = async (req, res) => {
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
    const reportData = { 
      ...req.body, 
      lab: labId,
      createdBy: req.user.id
    };

    // Generate report ID if not provided
    if (!reportData.reportId) {
      const lastReport = await Report.findOne({ lab: labId }).sort({ createdAt: -1 });
      const nextNumber = lastReport ? parseInt(lastReport.reportId.split('-')[1]) + 1 : 1;
      reportData.reportId = `RPT-${nextNumber.toString().padStart(4, '0')}`;
    }

    const report = new Report(reportData);
    await report.save();

    // Populate the created report
    await report.populate('patient', 'name patientId email phone');
    await report.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

// Update report
exports.updateReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reportId } = req.params;
    const labId = req.user.lab || req.params.labId;
    const updateData = req.body;

    const report = await Report.findOneAndUpdate(
      { _id: reportId, lab: labId },
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'name patientId email phone')
     .populate('createdBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const labId = req.user.lab || req.params.labId;

    const report = await Report.findOneAndDelete({ _id: reportId, lab: labId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

// Approve report
exports.approveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const labId = req.user.lab || req.params.labId;

    const report = await Report.findOneAndUpdate(
      { _id: reportId, lab: labId },
      { 
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('patient', 'name patientId email phone')
     .populate('approvedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report approved successfully',
      data: report
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve report',
      error: error.message
    });
  }
};

// Generate report PDF
exports.generateReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const labId = req.user.lab || req.params.labId;
    
    const report = await Report.findOne({ _id: reportId, lab: labId })
      .populate('patient', 'name patientId email phone age gender')
      .populate('lab', 'name address phone email logo');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Here you would integrate with PDF generation service
    // For now, returning the report data that would be used for PDF generation
    res.json({
      success: true,
      message: 'Report PDF data retrieved successfully',
      data: {
        report,
        pdfUrl: `/api/reports/${reportId}/pdf` // This would be the actual PDF URL
      }
    });
  } catch (error) {
    console.error('Generate report PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report PDF',
      error: error.message
    });
  }
};

// Get report templates
exports.getReportTemplates = async (req, res) => {
  try {
    const labId = req.user.lab || req.params.labId;
    
    // This would typically come from a templates collection
    // For now, returning sample templates
    const templates = [
      {
        id: 'blood-test',
        name: 'Blood Test Report',
        category: 'Hematology',
        fields: ['hemoglobin', 'wbc', 'rbc', 'platelets']
      },
      {
        id: 'urine-test',
        name: 'Urine Analysis Report',
        category: 'Clinical Pathology',
        fields: ['color', 'clarity', 'protein', 'glucose']
      },
      {
        id: 'lipid-profile',
        name: 'Lipid Profile Report',
        category: 'Biochemistry',
        fields: ['cholesterol', 'triglycerides', 'hdl', 'ldl']
      }
    ];

    res.json({
      success: true,
      message: 'Report templates retrieved successfully',
      data: templates
    });
  } catch (error) {
    console.error('Get report templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report templates',
      error: error.message
    });
  }
};

// Get report statistics
exports.getReportStats = async (req, res) => {
  try {
    const labId = req.user.lab || req.params.labId;

    const stats = await Report.aggregate([
      { $match: { lab: labId } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          pendingReports: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          reportsThisMonth: {
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
      message: 'Report statistics retrieved successfully',
      data: stats[0] || {
        totalReports: 0,
        pendingReports: 0,
        approvedReports: 0,
        reportsThisMonth: 0
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report statistics',
      error: error.message
    });
  }
};