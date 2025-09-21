import Lab from "../models/Lab.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Report from "../models/Report.js";
import Invoice from "../models/Invoice.js";
import Sample from "../models/Sample.js";
import { validationResult } from "express-validator";

// Get all labs (Super Admin only)
export const getAllLabs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const labs = await Lab.find(query)
      .populate("owner", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Lab.countDocuments(query);

    res.json({
      success: true,
      message: "Labs retrieved successfully",
      data: {
        labs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get all labs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve labs",
      error: error.message,
    });
  }
};

// Get lab by ID
console.log("Get lab by ID route");
export const getLabById = async (req, res) => {
  try {
    const { labId } = req.params;
    console.log("Get lab by ID route:", labId);
    const lab = await Lab.findById(labId)
      .populate("owner", "name email phone")
      .populate("staff", "name email role");
    console.log("Lab:", lab);
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }
    console.log("Get lab by ID route:", lab);
    res.json({
      success: true,
      message: "Lab retrieved successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Get lab by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lab",
      error: error.message,
    });
  }
};

// Create new lab (Super Admin only)
export const createLab = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const labData = req.body;
    const lab = new Lab(labData);
    await lab.save();

    res.status(201).json({
      success: true,
      message: "Lab created successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Create lab error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lab",
      error: error.message,
    });
  }
};

// Update lab
export const updateLab = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { labId } = req.params;
    const updateData = req.body;

    const lab = await Lab.findByIdAndUpdate(labId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    res.json({
      success: true,
      message: "Lab updated successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Update lab error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lab",
      error: error.message,
    });
  }
};

// Delete lab (Super Admin only)
export const deleteLab = async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await Lab.findByIdAndDelete(labId);

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    res.json({
      success: true,
      message: "Lab deleted successfully",
    });
  } catch (error) {
    console.error("Delete lab error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lab",
      error: error.message,
    });
  }
};

// Get lab dashboard data
console.log("Get lab dashboard data route");
export const getDashboardData = async (req, res) => {
  try {
    const { labId } = req.params;
    console.log("Get lab dashboard data route:", labId);
    // Find the lab
    const lab = await Lab.findById(labId);

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    // Get comprehensive dashboard metrics
    const [
      totalPatients,
      totalStaff,
      totalReports,
      pendingReports,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalSamples,
      processingSamples,
      completedSamples,
    ] = await Promise.all([
      // Patients count (assuming Patient model exists)
      Patient?.countDocuments({ labId }) || 0,
      // Staff count
      User.countDocuments({ labId, role: { $ne: "super_admin" } }),
      // Reports count (assuming Report model exists)
      Report?.countDocuments({ labId }) || 0,
      Report?.countDocuments({ labId, status: "pending" }) || 0,
      // Invoices count (assuming Invoice model exists)
      Invoice?.countDocuments({ labId }) || 0,
      Invoice?.countDocuments({ labId, status: "paid" }) || 0,
      Invoice?.countDocuments({ labId, status: "pending" }) || 0,
      // Samples count (assuming Sample model exists)
      Sample?.countDocuments({ labId }) || 0,
      Sample?.countDocuments({ labId, status: "processing" }) || 0,
      Sample?.countDocuments({ labId, status: "completed" }) || 0,
    ]);

    // Calculate revenue (mock data for now)
    const totalRevenue = paidInvoices * 1500; // Average invoice amount
    const pendingPayments = pendingInvoices * 1200;

    // Generate recent activity data
    const recentActivities = [
      {
        id: 1,
        type: "sample_received",
        message: "New sample received for processing",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        priority: "medium",
      },
      {
        id: 2,
        type: "report_generated",
        message: "Report generated for patient ID: PAT001",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        priority: "low",
      },
      {
        id: 3,
        type: "payment_received",
        message: "Payment received for invoice INV001",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        priority: "high",
      },
    ];

    // Generate alerts
    const alerts = [];
    if (pendingReports > 10) {
      alerts.push({
        id: 1,
        type: "warning",
        message: `${pendingReports} reports are pending review`,
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    }
    if (pendingInvoices > 5) {
      alerts.push({
        id: 2,
        type: "info",
        message: `${pendingInvoices} invoices are pending payment`,
        priority: "medium",
        timestamp: new Date().toISOString(),
      });
    }

    // Revenue trend data (mock data)
    const revenueData = [
      { month: "Jan", revenue: totalRevenue * 0.8 },
      { month: "Feb", revenue: totalRevenue * 0.85 },
      { month: "Mar", revenue: totalRevenue * 0.9 },
      { month: "Apr", revenue: totalRevenue * 0.95 },
      { month: "May", revenue: totalRevenue },
      { month: "Jun", revenue: totalRevenue * 1.05 },
    ];

    // Patient growth data (mock data)
    const patientGrowthData = [
      { month: "Jan", patients: Math.floor(totalPatients * 0.7) },
      { month: "Feb", patients: Math.floor(totalPatients * 0.75) },
      { month: "Mar", patients: Math.floor(totalPatients * 0.8) },
      { month: "Apr", patients: Math.floor(totalPatients * 0.9) },
      { month: "May", patients: Math.floor(totalPatients * 0.95) },
      { month: "Jun", patients: totalPatients },
    ];

    // Test status distribution
    const testStatusData = [
      {
        status: "Completed",
        count: completedSamples,
        percentage:
          totalSamples > 0
            ? Math.round((completedSamples / totalSamples) * 100)
            : 0,
      },
      {
        status: "Processing",
        count: processingSamples,
        percentage:
          totalSamples > 0
            ? Math.round((processingSamples / totalSamples) * 100)
            : 0,
      },
      {
        status: "Pending",
        count: totalSamples - completedSamples - processingSamples,
        percentage:
          totalSamples > 0
            ? Math.round(
                ((totalSamples - completedSamples - processingSamples) /
                  totalSamples) *
                  100
              )
            : 0,
      },
    ];

    const dashboardData = {
      lab: {
        id: lab._id,
        name: lab.name,
        email: lab.email,
        phone: lab.phone,
        address: lab.address,
      },
      stats: {
        totalPatients,
        totalStaff,
        totalReports,
        pendingReports,
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalSamples,
        processingSamples,
        completedSamples,
        totalRevenue,
        pendingPayments,
      },
      revenueData,
      patientGrowthData,
      testStatusData,
      recentActivities,
      alerts,
    };

    res.json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
      error: error.message,
    });
  }
};

// Get lab staff
export const getLabStaff = async (req, res) => {
  try {
    const { labId } = req.params;
    const { page = 1, limit = 10, role } = req.query;

    const query = { lab: labId };
    if (role) {
      query.role = role;
    }

    const staff = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: "Lab staff retrieved successfully",
      data: {
        staff,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get lab staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lab staff",
      error: error.message,
    });
  }
};

// Add staff to lab
export const addStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { labId } = req.params;
    const staffData = { ...req.body, lab: labId };

    const staff = new User(staffData);
    await staff.save();

    // Add staff to lab's staff array
    await Lab.findByIdAndUpdate(labId, { $push: { staff: staff._id } });

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Add staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add staff",
      error: error.message,
    });
  }
};

// Update staff
export const updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { labId, staffId } = req.params;
    const updateData = req.body;

    const staff = await User.findOneAndUpdate(
      { _id: staffId, lab: labId },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.json({
      success: true,
      message: "Staff updated successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update staff",
      error: error.message,
    });
  }
};

// Remove staff from lab
export const removeStaff = async (req, res) => {
  try {
    const { labId, staffId } = req.params;

    const staff = await User.findOneAndDelete({ _id: staffId, lab: labId });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Remove staff from lab's staff array
    await Lab.findByIdAndUpdate(labId, { $pull: { staff: staffId } });

    res.json({
      success: true,
      message: "Staff removed successfully",
    });
  } catch (error) {
    console.error("Remove staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove staff",
      error: error.message,
    });
  }
};

// Get lab settings
export const getLabSettings = async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await Lab.findById(labId).select("settings");

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    res.json({
      success: true,
      message: "Lab settings retrieved successfully",
      data: lab.settings || {},
    });
  } catch (error) {
    console.error("Get lab settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lab settings",
      error: error.message,
    });
  }
};

// Update lab settings
export const updateLabSettings = async (req, res) => {
  try {
    const { labId } = req.params;
    const settings = req.body;

    const lab = await Lab.findByIdAndUpdate(
      labId,
      { settings },
      { new: true, runValidators: true }
    );

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    res.json({
      success: true,
      message: "Lab settings updated successfully",
      data: lab.settings,
    });
  } catch (error) {
    console.error("Update lab settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lab settings",
      error: error.message,
    });
  }
};

// Default export for compatibility
export default {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
  getDashboardData,
  getLabStaff,
  addStaff,
  updateStaff,
  removeStaff,
  getLabSettings,
  updateLabSettings,
};
