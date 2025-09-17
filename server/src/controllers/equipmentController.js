import Equipment from '../models/Equipment.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all equipment with filtering and pagination
export const getEquipment = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      maintenanceDue = false,
      calibrationDue = false,
      department
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Maintenance due filter
    if (maintenanceDue === 'true') {
      query['maintenance.nextDue'] = { $lte: new Date() };
    }

    // Calibration due filter
    if (calibrationDue === 'true') {
      query['calibration.nextDue'] = { $lte: new Date() };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [equipment, total] = await Promise.all([
      Equipment.find(query)
        .populate('department', 'name code')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Equipment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        equipment,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get single equipment item
export const getEquipmentItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findOne({ _id: id, labId: req.user.labId })
      .populate('department', 'name code')
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('maintenance.records.performedBy', 'name email')
      .populate('calibration.records.performedBy', 'name email')
      .populate('usage.records.user', 'name email');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment item',
      error: error.message
    });
  }
};

// Create new equipment
export const createEquipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const equipmentData = {
      ...req.body,
      labId: req.user.labId,
      createdBy: req.user._id
    };

    const equipment = new Equipment(equipmentData);
    await equipment.save();

    await equipment.populate([
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Serial number already exists in this lab'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: error.message
    });
  }
};

// Update equipment
export const updateEquipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const equipment = await Equipment.findOneAndUpdate(
      { _id: id, labId: req.user.labId },
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Serial number already exists in this lab'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: error.message
    });
  }
};

// Delete equipment
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findOneAndDelete({ _id: id, labId: req.user.labId });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: error.message
    });
  }
};

// Add maintenance record
export const addMaintenanceRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { type, description, cost, performedBy, nextDue, parts, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findOne({ _id: id, labId: req.user.labId });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const maintenanceRecord = {
      date: new Date(),
      type,
      description,
      cost: cost || 0,
      performedBy: performedBy || req.user._id,
      parts: parts || [],
      notes,
      status: 'completed'
    };

    equipment.maintenance.records.push(maintenanceRecord);
    equipment.maintenance.lastPerformed = new Date();
    if (nextDue) {
      equipment.maintenance.nextDue = new Date(nextDue);
    }
    equipment.updatedBy = req.user._id;

    await equipment.save();

    await equipment.populate('maintenance.records.performedBy', 'name email');

    res.json({
      success: true,
      message: 'Maintenance record added successfully',
      data: {
        equipment,
        maintenanceRecord: equipment.maintenance.records[equipment.maintenance.records.length - 1]
      }
    });
  } catch (error) {
    console.error('Add maintenance record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add maintenance record',
      error: error.message
    });
  }
};

// Add calibration record
export const addCalibrationRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { method, results, performedBy, nextDue, certificateNumber, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findOne({ _id: id, labId: req.user.labId });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const calibrationRecord = {
      date: new Date(),
      method,
      results: results || [],
      performedBy: performedBy || req.user._id,
      certificateNumber,
      notes,
      status: 'passed'
    };

    equipment.calibration.records.push(calibrationRecord);
    equipment.calibration.lastPerformed = new Date();
    if (nextDue) {
      equipment.calibration.nextDue = new Date(nextDue);
    }
    equipment.updatedBy = req.user._id;

    await equipment.save();

    await equipment.populate('calibration.records.performedBy', 'name email');

    res.json({
      success: true,
      message: 'Calibration record added successfully',
      data: {
        equipment,
        calibrationRecord: equipment.calibration.records[equipment.calibration.records.length - 1]
      }
    });
  } catch (error) {
    console.error('Add calibration record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add calibration record',
      error: error.message
    });
  }
};

// Add usage record
export const addUsageRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { startTime, endTime, purpose, samples, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findOne({ _id: id, labId: req.user.labId });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end - start) / (1000 * 60)); // duration in minutes

    const usageRecord = {
      user: req.user._id,
      startTime: start,
      endTime: end,
      duration,
      purpose,
      samples: samples || [],
      notes
    };

    equipment.usage.records.push(usageRecord);
    equipment.usage.totalHours += duration / 60;
    equipment.usage.lastUsed = end;
    equipment.updatedBy = req.user._id;

    await equipment.save();

    await equipment.populate('usage.records.user', 'name email');

    res.json({
      success: true,
      message: 'Usage record added successfully',
      data: {
        equipment,
        usageRecord: equipment.usage.records[equipment.usage.records.length - 1]
      }
    });
  } catch (error) {
    console.error('Add usage record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add usage record',
      error: error.message
    });
  }
};

// Get equipment due for maintenance
export const getMaintenanceDue = async (req, res) => {
  try {
    const { page = 1, limit = 10, days = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const [equipment, total] = await Promise.all([
      Equipment.find({
        labId: req.user.labId,
        'maintenance.nextDue': { $lte: dueDate },
        status: { $in: ['active', 'maintenance'] }
      })
        .populate('department', 'name code')
        .populate('assignedTo', 'name email')
        .sort({ 'maintenance.nextDue': 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Equipment.countDocuments({
        labId: req.user.labId,
        'maintenance.nextDue': { $lte: dueDate },
        status: { $in: ['active', 'maintenance'] }
      })
    ]);

    res.json({
      success: true,
      data: {
        equipment,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get maintenance due error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment due for maintenance',
      error: error.message
    });
  }
};

// Get equipment due for calibration
export const getCalibrationDue = async (req, res) => {
  try {
    const { page = 1, limit = 10, days = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const [equipment, total] = await Promise.all([
      Equipment.find({
        labId: req.user.labId,
        'calibration.nextDue': { $lte: dueDate },
        status: { $in: ['active', 'calibration'] }
      })
        .populate('department', 'name code')
        .populate('assignedTo', 'name email')
        .sort({ 'calibration.nextDue': 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Equipment.countDocuments({
        labId: req.user.labId,
        'calibration.nextDue': { $lte: dueDate },
        status: { $in: ['active', 'calibration'] }
      })
    ]);

    res.json({
      success: true,
      data: {
        equipment,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get calibration due error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment due for calibration',
      error: error.message
    });
  }
};

// Get equipment statistics
export const getEquipmentStats = async (req, res) => {
  try {
    const labId = req.user.labId;

    const [totalEquipment, statusStats, categoryStats, maintenanceStats, utilizationStats] = await Promise.all([
      Equipment.countDocuments({ labId }),
      Equipment.aggregate([
        { $match: { labId: new mongoose.Types.ObjectId(labId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Equipment.aggregate([
        { $match: { labId: new mongoose.Types.ObjectId(labId) } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: '$purchaseInfo.cost' },
            avgAge: {
              $avg: {
                $divide: [
                  { $subtract: [new Date(), '$purchaseInfo.date'] },
                  1000 * 60 * 60 * 24 * 365 // Convert to years
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Equipment.aggregate([
        { $match: { labId: new mongoose.Types.ObjectId(labId) } },
        {
          $group: {
            _id: null,
            maintenanceDue: {
              $sum: {
                $cond: [{ $lte: ['$maintenance.nextDue', new Date()] }, 1, 0]
              }
            },
            calibrationDue: {
              $sum: {
                $cond: [{ $lte: ['$calibration.nextDue', new Date()] }, 1, 0]
              }
            },
            avgMaintenanceCost: { $avg: '$maintenance.totalCost' },
            totalMaintenanceCost: { $sum: '$maintenance.totalCost' }
          }
        }
      ]),
      Equipment.aggregate([
        { $match: { labId: new mongoose.Types.ObjectId(labId) } },
        {
          $group: {
            _id: null,
            totalUsageHours: { $sum: '$usage.totalHours' },
            avgUsageHours: { $avg: '$usage.totalHours' },
            mostUsedEquipment: { $max: '$usage.totalHours' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalEquipment,
          maintenanceDue: maintenanceStats[0]?.maintenanceDue || 0,
          calibrationDue: maintenanceStats[0]?.calibrationDue || 0,
          totalMaintenanceCost: maintenanceStats[0]?.totalMaintenanceCost || 0,
          avgMaintenanceCost: maintenanceStats[0]?.avgMaintenanceCost || 0
        },
        statusBreakdown: statusStats,
        categoryBreakdown: categoryStats,
        utilization: utilizationStats[0] || {
          totalUsageHours: 0,
          avgUsageHours: 0,
          mostUsedEquipment: 0
        }
      }
    });
  } catch (error) {
    console.error('Get equipment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment statistics',
      error: error.message
    });
  }
};

// Generate equipment report
export const generateEquipmentReport = async (req, res) => {
  try {
    const { format = 'json', category, status, includeHistory = false } = req.query;
    const labId = req.user.labId;

    const query = { labId };
    if (category) query.category = category;
    if (status) query.status = status;

    let equipment;
    if (includeHistory === 'true') {
      equipment = await Equipment.find(query)
        .populate('department', 'name code')
        .populate('assignedTo', 'name email')
        .populate('maintenance.records.performedBy', 'name email')
        .populate('calibration.records.performedBy', 'name email')
        .populate('usage.records.user', 'name email')
        .sort({ name: 1 });
    } else {
      equipment = await Equipment.find(query)
        .populate('department', 'name code')
        .populate('assignedTo', 'name email')
        .select('-maintenance.records -calibration.records -usage.records')
        .sort({ name: 1 });
    }

    const reportData = {
      generatedAt: new Date(),
      generatedBy: req.user.name,
      filters: { category, status, includeHistory },
      totalEquipment: equipment.length,
      equipment
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Name', 'Model', 'Manufacturer', 'Serial Number', 'Category',
        'Status', 'Department', 'Assigned To', 'Purchase Date', 'Purchase Cost',
        'Last Maintenance', 'Next Maintenance', 'Last Calibration', 'Next Calibration'
      ];
      
      const csvRows = equipment.map(item => [
        item.name,
        item.model,
        item.manufacturer,
        item.serialNumber,
        item.category,
        item.status,
        item.department?.name || '',
        item.assignedTo?.name || '',
        item.purchaseInfo?.date ? item.purchaseInfo.date.toISOString().split('T')[0] : '',
        item.purchaseInfo?.cost || '',
        item.maintenance?.lastPerformed ? item.maintenance.lastPerformed.toISOString().split('T')[0] : '',
        item.maintenance?.nextDue ? item.maintenance.nextDue.toISOString().split('T')[0] : '',
        item.calibration?.lastPerformed ? item.calibration.lastPerformed.toISOString().split('T')[0] : '',
        item.calibration?.nextDue ? item.calibration.nextDue.toISOString().split('T')[0] : ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=equipment-report.csv');
      return res.send(csvContent);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Generate equipment report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate equipment report',
      error: error.message
    });
  }
};

export default {
  getEquipment,
  getEquipmentItem,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  addMaintenanceRecord,
  addCalibrationRecord,
  addUsageRecord,
  getMaintenanceDue,
  getCalibrationDue,
  getEquipmentStats,
  generateEquipmentReport
};