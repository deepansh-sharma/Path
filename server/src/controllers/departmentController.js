import Department from '../models/Department.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all departments with filtering and pagination
export const getDepartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      isActive,
      location
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (location) query['location.building'] = { $regex: location, $options: 'i' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('head', 'name email role phone')
        .populate('staff.userId', 'name email role')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Department.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        departments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
};

// Get single department
export const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const department = await Department.findOne({ _id: id, labId: req.user.labId })
      .populate('head', 'name email role phone profileImage')
      .populate('staff.userId', 'name email role phone profileImage')
      .populate('createdBy', 'name email role')
      .populate('equipment', 'name model status location')
      .populate('inventory', 'name currentStock category')
      .populate('tests', 'name code category pricing');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department',
      error: error.message
    });
  }
};

// Create new department
export const createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if department code already exists
    const existingDepartment = await Department.findOne({
      labId: req.user.labId,
      code: req.body.code
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department code already exists'
      });
    }

    const departmentData = {
      ...req.body,
      labId: req.user.labId,
      createdBy: req.user._id
    };

    const department = new Department(departmentData);
    await department.save();

    await department.populate([
      { path: 'head', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
      { path: 'staff.userId', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const department = await Department.findOne({ _id: id, labId: req.user.labId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department code is being changed and if it already exists
    if (req.body.code && req.body.code !== department.code) {
      const existingDepartment = await Department.findOne({
        labId: req.user.labId,
        code: req.body.code,
        _id: { $ne: id }
      });

      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department code already exists'
        });
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'head', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
      { path: 'staff.userId', select: 'name email role' }
    ]);

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const department = await Department.findOne({ _id: id, labId: req.user.labId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active staff, equipment, or tests
    const Test = mongoose.model('Test');
    const Equipment = mongoose.model('Equipment');
    const User = mongoose.model('User');
    
    const [testsCount, equipmentCount, staffCount] = await Promise.all([
      Test.countDocuments({ department: id }),
      Equipment.countDocuments({ department: id }),
      User.countDocuments({ department: id, isActive: true })
    ]);

    if (testsCount > 0 || equipmentCount > 0 || staffCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department. It has associated tests, equipment, or active staff.',
        data: {
          testsCount,
          equipmentCount,
          staffCount
        }
      });
    }

    await Department.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message
    });
  }
};

// Add staff to department
export const addStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, permissions, startDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department or user ID'
      });
    }

    const department = await Department.findOne({ _id: id, labId: req.user.labId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if user is already in the department
    const existingStaff = department.staff.find(s => s.userId.toString() === userId);
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this department'
      });
    }

    // Verify user exists and belongs to the same lab
    const User = mongoose.model('User');
    const user = await User.findOne({ _id: userId, labId: req.user.labId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newStaff = {
      userId,
      role: role || 'staff',
      permissions: permissions || [],
      joinedAt: startDate || new Date(),
      isActive: true
    };

    department.staff.push(newStaff);
    await department.save();

    await department.populate('staff.userId', 'name email role');

    res.json({
      success: true,
      message: 'Staff member added successfully',
      data: {
        department: department.name,
        staff: department.staff
      }
    });
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add staff member',
      error: error.message
    });
  }
};

// Remove staff from department
export const removeStaff = async (req, res) => {
  try {
    const { id, staffId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department or staff ID'
      });
    }

    const department = await Department.findOne({ _id: id, labId: req.user.labId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const staffIndex = department.staff.findIndex(s => s.userId.toString() === staffId);
    if (staffIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found in this department'
      });
    }

    // Don't allow removing the department head
    if (department.head && department.head.toString() === staffId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove department head. Assign a new head first.'
      });
    }

    department.staff.splice(staffIndex, 1);
    await department.save();

    res.json({
      success: true,
      message: 'Staff member removed successfully'
    });
  } catch (error) {
    console.error('Remove staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove staff member',
      error: error.message
    });
  }
};

// Update staff role/permissions
export const updateStaff = async (req, res) => {
  try {
    const { id, staffId } = req.params;
    const { role, permissions, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department or staff ID'
      });
    }

    const department = await Department.findOne({ _id: id, labId: req.user.labId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const staffMember = department.staff.find(s => s.userId.toString() === staffId);
    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found in this department'
      });
    }

    // Update staff information
    if (role) staffMember.role = role;
    if (permissions) staffMember.permissions = permissions;
    if (isActive !== undefined) staffMember.isActive = isActive;

    await department.save();
    await department.populate('staff.userId', 'name email role');

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        department: department.name,
        updatedStaff: staffMember
      }
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: error.message
    });
  }
};

// Get department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateFrom, dateTo } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const department = await Department.findOne({ _id: id, labId: req.user.labId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Get related models
    const Test = mongoose.model('Test');
    const Equipment = mongoose.model('Equipment');
    const Sample = mongoose.model('Sample');
    const Report = mongoose.model('Report');

    const [testsStats, equipmentStats, samplesStats, reportsStats, performanceStats] = await Promise.all([
      Test.aggregate([
        { $match: { department: department._id, ...dateFilter } },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            activeTests: { $sum: { $cond: ['$isActive', 1, 0] } },
            totalRevenue: { $sum: { $multiply: ['$statistics.totalOrders', '$pricing.basePrice'] } },
            avgPrice: { $avg: '$pricing.basePrice' }
          }
        }
      ]),
      Equipment.aggregate([
        { $match: { department: department._id, ...dateFilter } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Sample.aggregate([
        { $match: { department: department._id, ...dateFilter } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Report.aggregate([
        { $match: { department: department._id, ...dateFilter } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      department.calculatePerformanceMetrics()
    ]);

    const stats = {
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
        staffCount: department.staff.filter(s => s.isActive).length,
        totalCapacity: department.capacity?.total || 0
      },
      tests: testsStats[0] || {
        totalTests: 0,
        activeTests: 0,
        totalRevenue: 0,
        avgPrice: 0
      },
      equipment: {
        total: equipmentStats.reduce((sum, e) => sum + e.count, 0),
        breakdown: equipmentStats
      },
      samples: {
        total: samplesStats.reduce((sum, s) => sum + s.count, 0),
        breakdown: samplesStats
      },
      reports: {
        total: reportsStats.reduce((sum, r) => sum + r.count, 0),
        breakdown: reportsStats
      },
      performance: performanceStats,
      budget: department.budget,
      workingHours: department.workingHours
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department statistics',
      error: error.message
    });
  }
};

// Get all departments overview
export const getDepartmentsOverview = async (req, res) => {
  try {
    const labId = req.user.labId;

    const [departmentStats, performanceComparison] = await Promise.all([
      Department.aggregate([
        { $match: { labId, isActive: true } },
        {
          $lookup: {
            from: 'tests',
            localField: '_id',
            foreignField: 'department',
            as: 'tests'
          }
        },
        {
          $lookup: {
            from: 'equipment',
            localField: '_id',
            foreignField: 'department',
            as: 'equipment'
          }
        },
        {
          $project: {
            name: 1,
            code: 1,
            status: 1,
            staffCount: { $size: { $filter: { input: '$staff', cond: '$$this.isActive' } } },
            testsCount: { $size: '$tests' },
            equipmentCount: { $size: '$equipment' },
            activeEquipment: {
              $size: {
                $filter: {
                  input: '$equipment',
                  cond: { $eq: ['$$this.status', 'operational'] }
                }
              }
            },
            totalRevenue: {
              $sum: {
                $map: {
                  input: '$tests',
                  as: 'test',
                  in: { $multiply: ['$$test.statistics.totalOrders', '$$test.pricing.basePrice'] }
                }
              }
            },
            capacity: '$capacity.total',
            utilization: '$performance.utilization'
          }
        },
        { $sort: { name: 1 } }
      ]),
      Department.aggregate([
        { $match: { labId, isActive: true } },
        {
          $project: {
            name: 1,
            efficiency: '$performance.efficiency',
            utilization: '$performance.utilization',
            qualityScore: '$performance.qualityScore',
            costPerTest: '$performance.costPerTest'
          }
        },
        { $sort: { efficiency: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        departments: departmentStats,
        performanceRanking: performanceComparison,
        summary: {
          totalDepartments: departmentStats.length,
          totalStaff: departmentStats.reduce((sum, d) => sum + d.staffCount, 0),
          totalTests: departmentStats.reduce((sum, d) => sum + d.testsCount, 0),
          totalEquipment: departmentStats.reduce((sum, d) => sum + d.equipmentCount, 0),
          totalRevenue: departmentStats.reduce((sum, d) => sum + (d.totalRevenue || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error('Get departments overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments overview',
      error: error.message
    });
  }
};

export default {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addStaff,
  removeStaff,
  updateStaff,
  getDepartmentStats,
  getDepartmentsOverview
};