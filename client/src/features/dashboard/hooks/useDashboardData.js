import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../../../api/dashboardApi';

export const useDashboardData = (userRole = 'lab_admin', labId = null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    revenueData: [],
    patientGrowth: [],
    testStatus: [],
    recentActivities: [],
    alerts: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (userRole === 'super_admin') {
        data = await dashboardApi.getSuperAdminDashboard();
      } else {
        data = await dashboardApi.getLabAdminDashboard(labId);
      }

      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data for development
      setDashboardData({
        stats: {
          totalLabs: userRole === 'super_admin' ? 156 : undefined,
          totalUsers: userRole === 'super_admin' ? 2847 : undefined,
          totalPatients: userRole === 'lab_admin' ? 1960 : undefined,
          totalTests: userRole === 'lab_admin' ? 8450 : undefined,
          monthlyRevenue: 1250000,
          activeSubscriptions: userRole === 'super_admin' ? 142 : undefined,
          pendingReports: userRole === 'lab_admin' ? 23 : undefined,
          completedTests: userRole === 'lab_admin' ? 245 : undefined
        },
        revenueData: [
          { month: 'Jan', revenue: 850000, target: 900000 },
          { month: 'Feb', revenue: 920000, target: 950000 },
          { month: 'Mar', revenue: 980000, target: 1000000 },
          { month: 'Apr', revenue: 1050000, target: 1100000 },
          { month: 'May', revenue: 1120000, target: 1150000 },
          { month: 'Jun', revenue: 1250000, target: 1200000 }
        ],
        patientGrowth: [
          { month: 'Jan', newPatients: 45, totalPatients: 1200 },
          { month: 'Feb', newPatients: 52, totalPatients: 1252 },
          { month: 'Mar', newPatients: 48, totalPatients: 1300 },
          { month: 'Apr', newPatients: 61, totalPatients: 1361 },
          { month: 'May', newPatients: 55, totalPatients: 1416 },
          { month: 'Jun', newPatients: 67, totalPatients: 1483 }
        ],
        testStatus: [
          { name: 'Completed', value: 245, color: '#10B981' },
          { name: 'In Progress', value: 89, color: '#F59E0B' },
          { name: 'Pending', value: 67, color: '#EF4444' },
          { name: 'On Hold', value: 23, color: '#6B7280' }
        ],
        recentActivities: [
          { 
            id: 1, 
            type: 'patient_registered', 
            message: 'New patient John Doe registered',
            time: '2 hours ago',
            user: 'Dr. Smith'
          },
          { 
            id: 2, 
            type: 'report_completed', 
            message: 'Blood test report completed for Jane Smith',
            time: '4 hours ago',
            user: 'Lab Tech'
          },
          { 
            id: 3, 
            type: 'payment_received', 
            message: 'Payment of ₹2,500 received from Mike Johnson',
            time: '6 hours ago',
            user: 'Finance'
          }
        ],
        alerts: [
          { 
            id: 1, 
            type: 'warning', 
            message: 'Low inventory: Blood collection tubes running low',
            priority: 'high',
            timestamp: new Date().toISOString()
          },
          { 
            id: 2, 
            type: 'info', 
            message: '5 reports pending approval',
            priority: 'medium',
            timestamp: new Date().toISOString()
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [userRole, labId]);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    dashboardData,
    refreshData,
    stats: dashboardData.stats,
    revenueData: dashboardData.revenueData,
    patientGrowth: dashboardData.patientGrowth,
    testStatus: dashboardData.testStatus,
    recentActivities: dashboardData.recentActivities,
    alerts: dashboardData.alerts
  };
};

export default useDashboardData;