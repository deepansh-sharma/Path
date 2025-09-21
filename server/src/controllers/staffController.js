import User from "../models/User.js";
import Lab from "../models/Lab.js";
import Department from "../models/Department.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import csv from "csv-parser";
import fs from "fs";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import Sample from "../models/Sample.js";
import Report from "../models/Report.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";

// Helper function to generate staff ID
const generateStaffId = async (labId) => {
  const lab = await Lab.findById(labId);
  const prefix = lab?.name?.substring(0, 3).toUpperCase() || 'LAB';
  const count = await User.countDocuments({ labId, role: { $ne: 'super_admin' } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
};

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Get all staff members
export const getStaff = async (req, res) => {
  try {
    const { labId } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      department = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      labId,
      role: { $ne: 'super_admin' }
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (department) {
      query.department = department;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [staff, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('labId', 'name')
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        staff,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff members',
      error: error.message
    });
  }
};

// Get staff member by ID
export const getStaffById = async (req, res) => {
  try {
    const { labId, staffId } = req.params;

    const staff = await User.findOne({
      _id: staffId,
      labId,
      role: { $ne: 'super_admin' }
    })
      .select('-password -refreshToken')
      .populate('labId', 'name')
      .lean();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff member',
      error: error.message
    });
  }
};

// Create new staff member
export const createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { labId } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      hireDate,
      address,
      emergencyContact,
      permissions = []
    } = req.body;

    // Check if lab exists
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Generate staff ID
    const staffId = await generateStaffId(labId);

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create staff member
    const staff = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role,
      labId,
      staffId,
      department,
      hireDate: hireDate || new Date(),
      address,
      emergencyContact,
      permissions,
      isActive: true,
      isEmailVerified: false,
      mustChangePassword: true
    });

    await staff.save();

    // Send welcome email with temporary password
    const welcomeEmailHtml = `
      <h2>Welcome to ${lab.name}</h2>
      <p>Hello ${firstName} ${lastName},</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p><strong>Staff ID:</strong> ${staffId}</p>
      <p>Please log in and change your password immediately.</p>
      <p>Best regards,<br>${lab.name} Team</p>
    `;

    try {
      await sendEmail(email, `Welcome to ${lab.name}`, welcomeEmailHtml);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Return staff data without password
    const staffData = staff.toObject();
    delete staffData.password;
    delete staffData.refreshToken;

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staffData
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create staff member',
      error: error.message
    });
  }
};

// Update staff member
export const updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { labId, staffId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.refreshToken;
    delete updateData.staffId;
    delete updateData.labId;

    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: staffId }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const staff = await User.findOneAndUpdate(
      { _id: staffId, labId, role: { $ne: 'super_admin' } },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .select('-password -refreshToken')
      .populate('labId', 'name');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
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

// Delete staff member
export const deleteStaff = async (req, res) => {
  try {
    const { labId, staffId } = req.params;

    const staff = await User.findOneAndDelete({
      _id: staffId,
      labId,
      role: { $ne: 'super_admin' }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member',
      error: error.message
    });
  }
};

// Toggle staff status
export const toggleStaffStatus = async (req, res) => {
  try {
    const { labId, staffId } = req.params;
    const { isActive } = req.body;

    const staff = await User.findOneAndUpdate(
      { _id: staffId, labId, role: { $ne: 'super_admin' } },
      { isActive, updatedAt: new Date() },
      { new: true }
    )
      .select('-password -refreshToken')
      .populate('labId', 'name');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: `Staff member ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: staff
    });
  } catch (error) {
    console.error('Toggle staff status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff status',
      error: error.message
    });
  }
};

// Update staff role
export const updateStaffRole = async (req, res) => {
  try {
    const { labId, staffId } = req.params;
    const { role, permissions = [] } = req.body;

    const staff = await User.findOneAndUpdate(
      { _id: staffId, labId, role: { $ne: 'super_admin' } },
      { role, permissions, updatedAt: new Date() },
      { new: true }
    )
      .select('-password -refreshToken')
      .populate('labId', 'name');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff role updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Update staff role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff role',
      error: error.message
    });
  }
};

// Get staff dashboard data
export const getStaffDashboard = async (req, res) => {
  try {
    const { labId } = req.params;

    const [
      totalStaff,
      activeStaff,
      inactiveStaff,
      recentStaff,
      roleDistribution,
      departmentDistribution
    ] = await Promise.all([
      User.countDocuments({ labId, role: { $ne: 'super_admin' } }),
      User.countDocuments({ labId, role: { $ne: 'super_admin' }, isActive: true }),
      User.countDocuments({ labId, role: { $ne: 'super_admin' }, isActive: false }),
      User.find({ labId, role: { $ne: 'super_admin' } })
        .select('firstName lastName role createdAt isActive')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      User.aggregate([
        { $match: { labId: labId, role: { $ne: 'super_admin' } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $match: { labId: labId, role: { $ne: 'super_admin' }, department: { $exists: true, $ne: null } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStaff,
          activeStaff,
          inactiveStaff,
          activePercentage: totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0
        },
        recentStaff,
        roleDistribution,
        departmentDistribution
      }
    });
  } catch (error) {
    console.error('Get staff dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff dashboard data',
      error: error.message
    });
  }
};

// Get staff analytics
export const getStaffAnalytics = async (req, res) => {
  try {
    const { labId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const matchStage = {
      labId: labId,
      role: { $ne: 'super_admin' },
      ...dateFilter
    };

    const [
      staffGrowth,
      roleAnalytics,
      departmentAnalytics,
      statusAnalytics
    ] = await Promise.all([
      User.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      User.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
          }
        }
      ]),
      User.aggregate([
        { $match: { ...matchStage, department: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]),
      User.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        staffGrowth,
        roleAnalytics,
        departmentAnalytics,
        statusAnalytics
      }
    });
  } catch (error) {
    console.error('Get staff analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff analytics',
      error: error.message
    });
  }
};

// Get staff performance
export const getStaffPerformance = async (req, res) => {
  try {
    const { labId, staffId } = req.params;
    const { startDate, endDate } = req.query;

    const staff = await User.findOne({
      _id: staffId,
      labId,
      role: { $ne: 'super_admin' }
    }).select('-password -refreshToken');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // This would typically involve aggregating data from other collections
    // like tests processed, reports generated, etc.
    // For now, returning basic performance metrics

    const performanceData = {
      staff: staff,
      metrics: {
        tasksCompleted: 0,
        averageRating: 0,
        punctualityScore: 0,
        productivityScore: 0
      },
      recentActivities: []
    };

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff performance',
      error: error.message
    });
  }
};

// Bulk update staff
export const bulkUpdateStaff = async (req, res) => {
  try {
    const { labId } = req.params;
    const { updates } = req.body;

    const results = [];

    for (const update of updates) {
      try {
        const { staffId, ...updateData } = update;
        
        // Remove sensitive fields
        delete updateData.password;
        delete updateData.refreshToken;
        delete updateData.staffId;
        delete updateData.labId;

        const staff = await User.findOneAndUpdate(
          { _id: staffId, labId, role: { $ne: 'super_admin' } },
          { ...updateData, updatedAt: new Date() },
          { new: true }
        ).select('-password -refreshToken');

        if (staff) {
          results.push({
            staffId,
            success: true,
            data: staff
          });
        } else {
          results.push({
            staffId,
            success: false,
            message: 'Staff member not found'
          });
        }
      } catch (error) {
        results.push({
          staffId: update.staffId,
          success: false,
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk update completed',
      data: results
    });
  } catch (error) {
    console.error('Bulk update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update staff',
      error: error.message
    });
  }
};

// Export staff data
export const exportStaff = async (req, res) => {
  try {
    const { labId } = req.params;
    const { format = 'csv' } = req.query;

    const staff = await User.find({
      labId,
      role: { $ne: 'super_admin' }
    })
      .select('-password -refreshToken')
      .populate('labId', 'name')
      .lean();

    if (format === 'csv') {
      const csvData = staff.map(member => ({
        'Staff ID': member.staffId,
        'First Name': member.firstName,
        'Last Name': member.lastName,
        'Email': member.email,
        'Phone': member.phone || '',
        'Role': member.role,
        'Department': member.department || '',
        'Status': member.isActive ? 'Active' : 'Inactive',
        'Hire Date': member.hireDate ? new Date(member.hireDate).toLocaleDateString() : '',
        'Created At': new Date(member.createdAt).toLocaleDateString()
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=staff-export.csv');
      
      const csvHeaders = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => Object.values(row).join(','));
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.send(csvContent);
    } else if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Staff');

      worksheet.columns = [
        { header: 'Staff ID', key: 'staffId', width: 15 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Department', key: 'department', width: 15 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Hire Date', key: 'hireDate', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 15 }
      ];

      staff.forEach(member => {
        worksheet.addRow({
          staffId: member.staffId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone || '',
          role: member.role,
          department: member.department || '',
          status: member.isActive ? 'Active' : 'Inactive',
          hireDate: member.hireDate ? new Date(member.hireDate).toLocaleDateString() : '',
          createdAt: new Date(member.createdAt).toLocaleDateString()
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=staff-export.xlsx');
      
      await workbook.xlsx.write(res);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    console.error('Export staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export staff data',
      error: error.message
    });
  }
};

// Import staff data
export const importStaff = async (req, res) => {
  try {
    const { labId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const results = [];
    const errors = [];

    // Process CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // Validate required fields
          if (!row.firstName || !row.lastName || !row.email || !row.role) {
            errors.push({
              row: row,
              message: 'Missing required fields'
            });
            return;
          }

          // Check if email already exists
          const existingUser = await User.findOne({ email: row.email });
          if (existingUser) {
            errors.push({
              row: row,
              message: 'Email already exists'
            });
            return;
          }

          // Generate staff ID and password
          const staffId = await generateStaffId(labId);
          const tempPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(tempPassword, 12);

          // Create staff member
          const staff = new User({
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || '',
            password: hashedPassword,
            role: row.role,
            labId,
            staffId,
            department: row.department || '',
            isActive: true,
            isEmailVerified: false,
            mustChangePassword: true
          });

          await staff.save();
          results.push({
            email: row.email,
            staffId: staffId,
            tempPassword: tempPassword
          });
        } catch (error) {
          errors.push({
            row: row,
            message: error.message
          });
        }
      })
      .on('end', () => {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          message: 'Import completed',
          data: {
            imported: results.length,
            errors: errors.length,
            results,
            errors
          }
        });
      });
  } catch (error) {
    console.error('Import staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import staff data',
      error: error.message
    });
  }
};

// Get roles and permissions
export const getRolesAndPermissions = async (req, res) => {
  try {
    const roles = [
      {
        value: 'lab_admin',
        label: 'Lab Admin',
        description: 'Full access to lab management',
        permissions: ['manage_staff', 'manage_patients', 'manage_tests', 'manage_reports', 'manage_invoices', 'view_analytics']
      },
      {
        value: 'technician',
        label: 'Technician',
        description: 'Handle test processing and results',
        permissions: ['manage_tests', 'update_test_results', 'view_patients']
      },
      {
        value: 'receptionist',
        label: 'Receptionist',
        description: 'Handle patient registration and appointments',
        permissions: ['manage_patients', 'manage_appointments', 'view_tests']
      },
      {
        value: 'finance',
        label: 'Finance',
        description: 'Handle billing and payments',
        permissions: ['manage_invoices', 'view_payments', 'view_analytics']
      },
      {
        value: 'staff',
        label: 'General Staff',
        description: 'Basic access to assigned tasks',
        permissions: ['view_assigned_tasks']
      }
    ];

    const permissions = [
      { value: 'manage_staff', label: 'Manage Staff', category: 'Staff Management' },
      { value: 'manage_patients', label: 'Manage Patients', category: 'Patient Management' },
      { value: 'manage_tests', label: 'Manage Tests', category: 'Test Management' },
      { value: 'manage_reports', label: 'Manage Reports', category: 'Report Management' },
      { value: 'manage_invoices', label: 'Manage Invoices', category: 'Financial Management' },
      { value: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
      { value: 'update_test_results', label: 'Update Test Results', category: 'Test Management' },
      { value: 'manage_appointments', label: 'Manage Appointments', category: 'Patient Management' },
      { value: 'view_payments', label: 'View Payments', category: 'Financial Management' },
      { value: 'view_assigned_tasks', label: 'View Assigned Tasks', category: 'Task Management' }
    ];

    res.json({
      success: true,
      data: {
        roles,
        permissions
      }
    });
  } catch (error) {
    console.error('Get roles and permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles and permissions',
      error: error.message
    });
  }
};

// Send invitation
export const sendInvitation = async (req, res) => {
  try {
    const { labId } = req.params;
    const { email, role, firstName, lastName } = req.body;

    // Check if lab exists
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate invitation token
    const invitationToken = jwt.sign(
      { email, role, labId, firstName, lastName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send invitation email
    const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
    const invitationEmailHtml = `
      <h2>Invitation to join ${lab.name}</h2>
      <p>Hello ${firstName} ${lastName},</p>
      <p>You have been invited to join ${lab.name} as a ${role}.</p>
      <p>Click the link below to accept the invitation and set up your account:</p>
      <a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
      <p>Best regards,<br>${lab.name} Team</p>
    `;

    await sendEmail(email, `Invitation to join ${lab.name}`, invitationEmailHtml);

    res.json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
      error: error.message
    });
  }
};

// Get staff member's own dashboard
export const getMyDashboard = async (req, res) => {
  try {
    const { userId, role, labId } = req.user; // from 'protect' middleware

    let dashboardData = {
      user: req.user,
    };

    // Placeholder for data fetching
    const commonData = {
      pendingTasks: await Task.countDocuments({ labId, assignedTo: userId, status: 'pending' }),
      notifications: await Notification.find({ labId, userId }).sort({ createdAt: -1 }).limit(10),
    };

    switch (role) {
      case 'technician':
        // Data for technicians: assigned samples, recent tests
        dashboardData.technicianData = {
          assignedSamples: await Sample.countDocuments({ labId, assignedTo: userId, status: 'processing' }),
          completedToday: await Report.countDocuments({ labId, processedBy: userId, createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }),
        };
        break;
      case 'receptionist':
        // Data for receptionists: patient registrations, appointments
        dashboardData.receptionistData = {
          patientsToday: await Patient.countDocuments({ labId, createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }),
          appointmentsToday: await Appointment.countDocuments({ labId, date: { $gte: new Date().setHours(0, 0, 0, 0) } }),
        };
        break;
      case 'finance':
        // Data for finance: invoices, payments
        dashboardData.financeData = {
          invoicesToday: await Invoice.countDocuments({ labId, createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }),
          paymentsToday: await Payment.countDocuments({ labId, date: { $gte: new Date().setHours(0, 0, 0, 0) } }),
        };
        break;
      default:
        // Generic data for other staff roles
        break;
    }

    res.json({
      success: true,
      data: { ...dashboardData, ...commonData },
    });
  } catch (error) {
    console.error("Get my dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff dashboard",
      error: error.message,
    });
  }
};

// Resend invitation
export const resendInvitation = async (req, res) => {
  try {
    const { labId, staffId } = req.params;

    const staff = await User.findOne({
      _id: staffId,
      labId,
      role: { $ne: 'super_admin' },
      isEmailVerified: false
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or already verified'
      });
    }

    const lab = await Lab.findById(labId);

    // Generate new invitation token
    const invitationToken = jwt.sign(
      { 
        email: staff.email, 
        role: staff.role, 
        labId, 
        firstName: staff.firstName, 
        lastName: staff.lastName,
        staffId: staff._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send invitation email
    const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
    const invitationEmailHtml = `
      <h2>Invitation to join ${lab.name}</h2>
      <p>Hello ${staff.firstName} ${staff.lastName},</p>
      <p>This is a reminder that you have been invited to join ${lab.name} as a ${staff.role}.</p>
      <p>Click the link below to accept the invitation and set up your account:</p>
      <a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
      <p>Best regards,<br>${lab.name} Team</p>
    `;

    await sendEmail(staff.email, `Invitation to join ${lab.name}`, invitationEmailHtml);

    res.json({
      success: true,
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend invitation',
      error: error.message
    });
  }
};