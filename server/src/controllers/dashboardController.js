import Lab from "../models/Lab.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Sample from "../models/Sample.js";
import Report from "../models/Report.js";
import Invoice from "../models/Invoice.js";

// Super Admin Dashboard Data
export const getSuperAdminDashboard = async (req, res) => {
  try {
    console.log('📊 Fetching Super Admin dashboard data...');
    
    // Get all labs count
    const totalLabs = await Lab.countDocuments();
    const activeLabs = await Lab.countDocuments({ isActive: true });
    const inactiveLabs = totalLabs - activeLabs;
    
    // Get all users count
    const totalUsers = await User.countDocuments();
    
    // Get total revenue from all labs
    const labs = await Lab.find({}).select('analytics');
    const totalRevenue = labs.reduce((sum, lab) => sum + (lab.analytics?.totalRevenue || 0), 0);
    
    // Get recent labs
    const recentLabs = await Lab.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email isActive createdAt subscription analytics');

    const dashboardData = {
      stats: {
        totalLabs,
        activeLabs,
        inactiveLabs,
        totalUsers,
        totalRevenue,
        activeSubscriptions: activeLabs
      },
      recentLabs,
      revenueData: [
        { month: 'Jan', revenue: 125000 },
        { month: 'Feb', revenue: 135000 },
        { month: 'Mar', revenue: 145000 },
        { month: 'Apr', revenue: 155000 },
        { month: 'May', revenue: 165000 },
        { month: 'Jun', revenue: 175000 }
      ],
      alerts: [
        {
          id: 1,
          type: 'warning',
          message: 'System maintenance scheduled for tonight',
          priority: 'medium',
          timestamp: new Date().toISOString()
        }
      ]
    };

    console.log('✅ Super Admin dashboard data fetched successfully');
    console.log('📈 Stats:', dashboardData.stats);

    res.json({
      success: true,
      message: 'Super Admin dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Super Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Super Admin dashboard data',
      error: error.message
    });
  }
};

// Super Admin Stats
export const getSuperAdminStats = async (req, res) => {
  try {
    console.log('📊 Fetching Super Admin stats...');
    
    const totalLabs = await Lab.countDocuments();
    const activeLabs = await Lab.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    
    const stats = {
      totalLabs,
      activeLabs,
      inactiveLabs: totalLabs - activeLabs,
      totalUsers,
      totalRevenue: 1250000 // This would be calculated from all labs
    };

    console.log('✅ Super Admin stats fetched:', stats);

    res.json({
      success: true,
      message: 'Super Admin stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('❌ Super Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Super Admin stats',
      error: error.message
    });
  }
};

// Lab Admin Dashboard Data (Enhanced version of existing getDashboardData)
export const getLabAdminDashboard = async (req, res) => {
  try {
    const { labId } = req.params;
    console.log(`📊 Fetching Lab Admin dashboard data for lab: ${labId}`);
    
    // Get lab details
    const lab = await Lab.findById(labId);
    if (!lab) {
      console.log(`❌ Lab not found: ${labId}`);
      return res.status(404).json({
        success: false,
        message: 'Lab not found'
      });
    }

    // Get counts for this lab
    const totalPatients = await Patient.countDocuments({ labId });
    const totalSamples = await Sample.countDocuments({ labId });
    const totalReports = await Report.countDocuments({ labId });
    const pendingReports = await Report.countDocuments({ labId, status: 'pending' });
    const completedTests = await Sample.countDocuments({ labId, status: 'completed' });
    
    // Get invoices data
    const invoices = await Invoice.find({ labId });
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    const pendingPayments = invoices
      .filter(invoice => invoice.paymentStatus === 'unpaid')
      .reduce((sum, invoice) => sum + (invoice.balanceAmount || 0), 0);

    // Get recent activities
    const recentSamples = await Sample.find({ labId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patientId', 'name')
      .populate('testId', 'name');

    const recentReports = await Report.find({ labId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patientId', 'name');

    const dashboardData = {
      lab,
      stats: {
        totalPatients,
        totalSamples,
        totalReports,
        pendingReports,
        completedTests,
        totalRevenue,
        pendingPayments
      },
      revenueData: [
        { month: 'Jan', revenue: 25000 },
        { month: 'Feb', revenue: 28000 },
        { month: 'Mar', revenue: 32000 },
        { month: 'Apr', revenue: 35000 },
        { month: 'May', revenue: 38000 },
        { month: 'Jun', revenue: 42000 }
      ],
      patientGrowth: [
        { month: 'Jan', patients: 45 },
        { month: 'Feb', patients: 52 },
        { month: 'Mar', patients: 61 },
        { month: 'Apr', patients: 68 },
        { month: 'May', patients: 75 },
        { month: 'Jun', patients: 82 }
      ],
      testStatus: [
        { name: 'Completed', value: completedTests, color: '#10B981' },
        { name: 'Pending', value: totalSamples - completedTests, color: '#F59E0B' },
        { name: 'In Progress', value: Math.floor(totalSamples * 0.2), color: '#3B82F6' }
      ],
      recentActivities: [
        ...recentSamples.map(sample => ({
          id: sample._id,
          type: 'sample',
          message: `New sample collected for ${sample.patientId?.name || 'Unknown Patient'}`,
          timestamp: sample.createdAt
        })),
        ...recentReports.map(report => ({
          id: report._id,
          type: 'report',
          message: `Report ${report.status} for ${report.patientId?.name || 'Unknown Patient'}`,
          timestamp: report.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10),
      alerts: [
        {
          id: 1,
          type: 'warning',
          message: `${pendingReports} reports pending approval`,
          priority: 'high',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'info',
          message: `₹${pendingPayments.toLocaleString()} in pending payments`,
          priority: 'medium',
          timestamp: new Date().toISOString()
        }
      ]
    };

    console.log('✅ Lab Admin dashboard data fetched successfully');
    console.log('📈 Lab Stats:', dashboardData.stats);

    res.json({
      success: true,
      message: 'Lab Admin dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Lab Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Lab Admin dashboard data',
      error: error.message
    });
  }
};