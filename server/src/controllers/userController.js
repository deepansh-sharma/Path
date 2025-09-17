import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Get all users with advanced filtering and search
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      department,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
      dateFrom,
      dateTo,
      hasPermission,
      lastLoginFrom,
      lastLoginTo
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (role) {
      if (Array.isArray(role)) {
        query.role = { $in: role };
      } else {
        query.role = role;
      }
    }
    
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Advanced search across multiple fields
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'profile.employeeId': searchRegex },
        { 'profile.specialization': searchRegex },
        { 'contact.address': searchRegex }
      ];
    }

    // Permission filter
    if (hasPermission) {
      query.permissions = { $in: [hasPermission] };
    }

    // Date range filters
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Last login date filter
    if (lastLoginFrom || lastLoginTo) {
      query.lastLogin = {};
      if (lastLoginFrom) query.lastLogin.$gte = new Date(lastLoginFrom);
      if (lastLoginTo) query.lastLogin.$lte = new Date(lastLoginTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('department', 'name code')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    // Add activity summary for each user
    const userIds = users.map(user => user._id);
    const activitySummary = await AuditLog.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: '$userId',
          totalActions: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          riskActions: {
            $sum: {
              $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0]
            }
          }
        }
      }
    ]);

    const activityMap = activitySummary.reduce((acc, item) => {
      acc[item._id.toString()] = item;
      return acc;
    }, {});

    const usersWithActivity = users.map(user => ({
      ...user.toObject(),
      activitySummary: activityMap[user._id.toString()] || {
        totalActions: 0,
        lastActivity: null,
        riskActions: 0
      }
    }));

    res.json({
      success: true,
      data: {
        users: usersWithActivity,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        filters: {
          search,
          role,
          department,
          isActive,
          dateFrom,
          dateTo
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get single user with detailed information
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findOne({ _id: id, labId: req.user.labId })
      .populate('department', 'name code head')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activity statistics
    const activityStats = await AuditLog.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          actionsByType: {
            $push: '$action'
          },
          riskDistribution: {
            $push: '$riskLevel'
          }
        }
      }
    ]);

    const stats = activityStats[0] || {
      totalActions: 0,
      lastActivity: null,
      actionsByType: [],
      riskDistribution: []
    };

    res.json({
      success: true,
      data: {
        user,
        activityStats: stats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      department,
      permissions = [],
      profile = {}
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(phone ? [{ phone }] : [])
      ],
      labId: req.user.labId
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone?.trim(),
      role,
      department,
      permissions,
      profile,
      labId: req.user.labId,
      createdBy: req.user._id,
      isActive: true
    });

    await user.save();

    // Populate the created user
    const populatedUser = await User.findById(user._id)
      .populate('department', 'name code')
      .populate('createdBy', 'name email')
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    res.status(201).json({
      success: true,
      data: { user: populatedUser },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.passwordHash;
    delete updates.resetPasswordToken;
    delete updates.resetPasswordExpires;
    delete updates.labId;
    delete updates.createdBy;
    delete updates.createdAt;

    // Check if email/phone already exists for another user
    if (updates.email || updates.phone) {
      const query = {
        _id: { $ne: id },
        labId: req.user.labId,
        $or: []
      };

      if (updates.email) query.$or.push({ email: updates.email.toLowerCase() });
      if (updates.phone) query.$or.push({ phone: updates.phone });

      const existingUser = await User.findOne(query);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email or phone already exists'
        });
      }
    }

    // Normalize email
    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
    }

    updates.updatedBy = req.user._id;
    updates.updatedAt = new Date();

    const user = await User.findOneAndUpdate(
      { _id: id, labId: req.user.labId },
      updates,
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('updatedBy', 'name email')
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Bulk update users
export const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updates } = req.body;

    // Validate all user IDs
    const invalidIds = userIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user IDs provided',
        invalidIds
      });
    }

    // Remove sensitive fields
    delete updates.passwordHash;
    delete updates.email;
    delete updates.labId;
    delete updates.createdBy;
    delete updates.createdAt;

    updates.updatedBy = req.user._id;
    updates.updatedAt = new Date();

    const result = await User.updateMany(
      {
        _id: { $in: userIds },
        labId: req.user.labId
      },
      updates
    );

    res.json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} users updated successfully`
    });
  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update users',
      error: error.message
    });
  }
};

// Soft delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, labId: req.user.labId },
      {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: req.user._id
      },
      { new: true }
    ).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user },
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const labId = req.user.labId;

    const [totalUsers, activeUsers, usersByRole, recentUsers, activityStats] = await Promise.all([
      User.countDocuments({ labId }),
      User.countDocuments({ labId, isActive: true }),
      User.aggregate([
        { $match: { labId } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.find({ labId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role createdAt')
        .populate('createdBy', 'name'),
      AuditLog.aggregate([
        {
          $match: {
            labId,
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$userId',
            actionCount: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $group: {
            _id: null,
            activeUsers: { $sum: 1 },
            totalActions: { $sum: '$actionCount' },
            avgActionsPerUser: { $avg: '$actionCount' }
          }
        }
      ])
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentUsers,
      activityStats: activityStats[0] || {
        activeUsers: 0,
        totalActions: 0,
        avgActionsPerUser: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

// Get user activity logs
export const getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      AuditLog.find({ userId: id, labId: req.user.labId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments({ userId: id, labId: req.user.labId })
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

// Export users data
export const exportUsers = async (req, res) => {
  try {
    const { format = 'json', fields } = req.query;
    const labId = req.user.labId;

    const selectedFields = fields || [
      'name', 'email', 'phone', 'role', 'department', 
      'isActive', 'lastLogin', 'createdAt'
    ];

    const users = await User.find({ labId })
      .populate('department', 'name code')
      .select(selectedFields.join(' '))
      .sort({ name: 1 })
      .limit(5000); // Limit for performance

    if (format === 'csv') {
      const csvHeaders = selectedFields;
      const csvRows = users.map(user => {
        return selectedFields.map(field => {
          if (field === 'department') {
            return user.department?.name || '';
          }
          return user[field] || '';
        });
      });

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      return res.send(csvContent);
    }

    res.json({
      success: true,
      data: {
        users,
        exportedAt: new Date(),
        totalRecords: users.length
      }
    });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
};