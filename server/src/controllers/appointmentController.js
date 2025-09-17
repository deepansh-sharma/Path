import Appointment from '../models/Appointment.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all appointments with filtering and pagination
export const getAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      department,
      search,
      sortBy = 'appointmentDate',
      sortOrder = 'asc',
      dateFrom,
      dateTo,
      patientId,
      staffId
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (patientId) query['patient.id'] = patientId;
    if (staffId) query.assignedStaff = staffId;
    
    if (search) {
      query.$or = [
        { 'patient.name': { $regex: search, $options: 'i' } },
        { 'patient.phone': { $regex: search, $options: 'i' } },
        { 'patient.email': { $regex: search, $options: 'i' } },
        { appointmentId: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.appointmentDate = {};
      if (dateFrom) query.appointmentDate.$gte = new Date(dateFrom);
      if (dateTo) query.appointmentDate.$lte = new Date(dateTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('department', 'name code')
        .populate('assignedStaff', 'name email phone')
        .populate('tests.testId', 'name code category')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get single appointment
export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findOne({ _id: id, labId: req.user.labId })
      .populate('department', 'name code location')
      .populate('assignedStaff', 'name email phone role')
      .populate('tests.testId', 'name code category price turnaroundTime')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('reminders.sentBy', 'name email')
      .populate('followUp.scheduledBy', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const appointmentData = {
      ...req.body,
      labId: req.user.labId,
      createdBy: req.user._id
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    await appointment.populate([
      { path: 'department', select: 'name code' },
      { path: 'assignedStaff', select: 'name email phone' },
      { path: 'tests.testId', select: 'name code category price' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
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
        message: 'Invalid appointment ID'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, labId: req.user.labId },
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'department', select: 'name code' },
      { path: 'assignedStaff', select: 'name email phone' },
      { path: 'tests.testId', select: 'name code category price' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findOneAndDelete({ _id: id, labId: req.user.labId });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

// Check appointment availability
export const checkAvailability = async (req, res) => {
  try {
    const { date, timeSlot, department, staff } = req.query;

    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Date and time slot are required'
      });
    }

    const appointmentDate = new Date(date);
    const query = {
      labId: req.user.labId,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
      },
      'timeSlot.start': timeSlot,
      status: { $nin: ['cancelled', 'no_show'] }
    };

    if (department) query.department = department;
    if (staff) query.assignedStaff = staff;

    const existingAppointment = await Appointment.findOne(query);

    res.json({
      success: true,
      data: {
        available: !existingAppointment,
        conflictingAppointment: existingAppointment ? {
          id: existingAppointment._id,
          patient: existingAppointment.patient.name,
          timeSlot: existingAppointment.timeSlot
        } : null
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};

// Reschedule appointment
export const rescheduleAppointment = async (req, res) => {
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
    const { newDate, newTimeSlot, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findOne({ _id: id, labId: req.user.labId });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if new slot is available
    const conflictingAppointment = await Appointment.findOne({
      labId: req.user.labId,
      _id: { $ne: id },
      appointmentDate: new Date(newDate),
      'timeSlot.start': newTimeSlot.start,
      status: { $nin: ['cancelled', 'no_show'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is not available'
      });
    }

    // Store original appointment details
    const originalDate = appointment.appointmentDate;
    const originalTimeSlot = appointment.timeSlot;

    // Update appointment
    appointment.appointmentDate = new Date(newDate);
    appointment.timeSlot = newTimeSlot;
    appointment.status = 'rescheduled';
    appointment.rescheduling = {
      originalDate,
      originalTimeSlot,
      newDate: new Date(newDate),
      newTimeSlot,
      reason,
      rescheduledBy: req.user._id,
      rescheduledAt: new Date()
    };
    appointment.updatedBy = req.user._id;

    await appointment.save();

    await appointment.populate([
      { path: 'department', select: 'name code' },
      { path: 'assignedStaff', select: 'name email phone' },
      { path: 'rescheduling.rescheduledBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment',
      error: error.message
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAmount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findOne({ _id: id, labId: req.user.labId });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellation = {
      reason,
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      refundAmount: refundAmount || 0
    };
    appointment.updatedBy = req.user._id;

    await appointment.save();

    await appointment.populate('cancellation.cancelledBy', 'name email');

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// Check-in appointment
export const checkInAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findOne({ _id: id, labId: req.user.labId });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed appointments can be checked in'
      });
    }

    await appointment.performCheckIn(req.user._id, notes);

    await appointment.populate('checkIn.checkedInBy', 'name email');

    res.json({
      success: true,
      message: 'Patient checked in successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Check-in appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in appointment',
      error: error.message
    });
  }
};

// Check-out appointment
export const checkOutAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findOne({ _id: id, labId: req.user.labId });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!['checked_in', 'in_progress'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only checked-in or in-progress appointments can be checked out'
      });
    }

    await appointment.performCheckOut(req.user._id, notes, paymentStatus);

    await appointment.populate('checkOut.checkedOutBy', 'name email');

    res.json({
      success: true,
      message: 'Patient checked out successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Check-out appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out appointment',
      error: error.message
    });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const labId = req.user.labId;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.appointmentDate = {};
      if (dateFrom) dateFilter.appointmentDate.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.appointmentDate.$lte = new Date(dateTo);
    }

    const baseQuery = { labId, ...dateFilter };

    const [totalAppointments, statusStats, departmentStats, dailyStats, revenueStats] = await Promise.all([
      Appointment.countDocuments(baseQuery),
      Appointment.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Appointment.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$payment.amount' }
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'departmentInfo'
          }
        },
        { $sort: { count: -1 } }
      ]),
      Appointment.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$payment.amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Appointment.aggregate([
        { $match: { ...baseQuery, 'payment.status': 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$payment.amount' },
            averageRevenue: { $avg: '$payment.amount' },
            paidAppointments: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalAppointments,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          averageRevenue: revenueStats[0]?.averageRevenue || 0,
          paidAppointments: revenueStats[0]?.paidAppointments || 0
        },
        statusBreakdown: statusStats,
        departmentBreakdown: departmentStats,
        dailyTrends: dailyStats
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment statistics',
      error: error.message
    });
  }
};

// Get today's appointments
export const getTodaysAppointments = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      labId: req.user.labId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .populate('department', 'name code')
      .populate('assignedStaff', 'name email')
      .populate('tests.testId', 'name code')
      .sort({ 'timeSlot.start': 1 });

    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      checkedIn: appointments.filter(apt => apt.status === 'checked_in').length,
      inProgress: appointments.filter(apt => apt.status === 'in_progress').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length
    };

    res.json({
      success: true,
      data: {
        appointments,
        stats
      }
    });
  } catch (error) {
    console.error('Get today\'s appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s appointments',
      error: error.message
    });
  }
};

export default {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkAvailability,
  rescheduleAppointment,
  cancelAppointment,
  checkInAppointment,
  checkOutAppointment,
  getAppointmentStats,
  getTodaysAppointments
};