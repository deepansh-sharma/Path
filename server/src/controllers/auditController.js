import AuditLog from '../models/AuditLog.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all audit logs with filtering and pagination
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      resource,
      userId,
      riskLevel,
      search,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      ipAddress,
      complianceStandard
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;
    if (riskLevel) query.riskLevel = riskLevel;
    if (ipAddress) query.ipAddress = ipAddress;
    if (complianceStandard) query['compliance.standards'] = complianceStandard;
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'details.notes': { $regex: search, $options: 'i' } },
        { 'target.name': { $regex: search, $options: 'i' } },
        { userAgent: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email role')
        .populate('target.id', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

// Get single audit log
export const getAuditLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid audit log ID'
      });
    }

    const log = await AuditLog.findOne({ _id: id, labId: req.user.labId })
      .populate('userId', 'name email role phone')
      .populate('target.id', 'name email role');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: error.message
    });
  }
};

// Create audit log (usually called internally by middleware)
export const createAuditLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const logData = {
      ...req.body,
      labId: req.user.labId,
      userId: req.user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const log = new AuditLog(logData);
    await log.save();

    await log.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: log
    });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create audit log',
      error: error.message
    });
  }
};

// Get audit statistics
export const getAuditStats = async (req, res) => {
  try {
    const { dateFrom, dateTo, period = 'daily' } = req.query;
    const labId = req.user.labId;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.timestamp = {};
      if (dateFrom) dateFilter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.timestamp.$lte = new Date(dateTo);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.timestamp = { $gte: thirtyDaysAgo };
    }

    const baseQuery = { labId, ...dateFilter };

    const [totalLogs, actionStats, resourceStats, riskStats, userStats, timelineStats] = await Promise.all([
      AuditLog.countDocuments(baseQuery),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$resource',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$riskLevel',
            count: { $sum: 1 }
          }
        }
      ]),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            actions: { $addToSet: '$action' },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === 'hourly' ? '%Y-%m-%d %H:00' : 
                       period === 'weekly' ? '%Y-%U' : '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            count: { $sum: 1 },
            highRiskCount: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'high'] }, 1, 0] }
            },
            criticalCount: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'critical'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalLogs,
          highRiskLogs: riskStats.find(r => r._id === 'high')?.count || 0,
          criticalLogs: riskStats.find(r => r._id === 'critical')?.count || 0,
          uniqueUsers: userStats.length
        },
        actionBreakdown: actionStats,
        resourceBreakdown: resourceStats,
        riskBreakdown: riskStats,
        topUsers: userStats,
        timeline: timelineStats
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error.message
    });
  }
};

// Get compliance report
export const getComplianceReport = async (req, res) => {
  try {
    const { standard, dateFrom, dateTo } = req.query;
    const labId = req.user.labId;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.timestamp = {};
      if (dateFrom) dateFilter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.timestamp.$lte = new Date(dateTo);
    }

    const baseQuery = { labId, ...dateFilter };
    if (standard) {
      baseQuery['compliance.standards'] = standard;
    }

    const [complianceLogs, violationStats, auditTrail] = await Promise.all([
      AuditLog.find({
        ...baseQuery,
        'compliance.required': true
      })
        .populate('userId', 'name email role')
        .sort({ timestamp: -1 })
        .limit(100),
      AuditLog.aggregate([
        {
          $match: {
            ...baseQuery,
            'compliance.violations': { $exists: true, $ne: [] }
          }
        },
        {
          $unwind: '$compliance.violations'
        },
        {
          $group: {
            _id: '$compliance.violations.type',
            count: { $sum: 1 },
            severity: { $first: '$compliance.violations.severity' },
            examples: { $push: '$compliance.violations.description' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            totalActions: { $sum: 1 },
            complianceActions: {
              $sum: { $cond: ['$compliance.required', 1, 0] }
            },
            violations: {
              $sum: {
                $cond: [
                  { $gt: [{ $size: { $ifNull: ['$compliance.violations', []] } }, 0] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $addFields: {
            complianceRate: {
              $multiply: [
                { $divide: ['$complianceActions', '$totalActions'] },
                100
              ]
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const reportData = {
      generatedAt: new Date(),
      generatedBy: req.user.name,
      period: { from: dateFrom, to: dateTo },
      standard,
      summary: {
        totalComplianceLogs: complianceLogs.length,
        totalViolations: violationStats.reduce((sum, v) => sum + v.count, 0),
        violationTypes: violationStats.length,
        overallComplianceRate: auditTrail.length > 0 ? 
          auditTrail.reduce((sum, day) => sum + (day.complianceRate || 0), 0) / auditTrail.length : 100
      },
      violations: violationStats,
      dailyCompliance: auditTrail,
      recentLogs: complianceLogs.slice(0, 20)
    };

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Get compliance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate compliance report',
      error: error.message
    });
  }
};

// Get risk analysis
export const getRiskAnalysis = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const labId = req.user.labId;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.timestamp = {};
      if (dateFrom) dateFilter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.timestamp.$lte = new Date(dateTo);
    } else {
      // Default to last 7 days for risk analysis
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter.timestamp = { $gte: sevenDaysAgo };
    }

    const baseQuery = { labId, ...dateFilter };

    const [riskTrends, suspiciousActivities, userRiskProfiles, resourceRisks] = await Promise.all([
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              risk: '$riskLevel'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            risks: {
              $push: {
                level: '$_id.risk',
                count: '$count'
              }
            },
            totalEvents: { $sum: '$count' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      AuditLog.find({
        ...baseQuery,
        riskLevel: { $in: ['high', 'critical'] }
      })
        .populate('userId', 'name email role')
        .sort({ timestamp: -1 })
        .limit(20),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$userId',
            totalActions: { $sum: 1 },
            riskDistribution: {
              $push: '$riskLevel'
            },
            failedActions: {
              $sum: { $cond: [{ $eq: ['$outcome', 'failure'] }, 1, 0] }
            },
            lastActivity: { $max: '$timestamp' },
            uniqueResources: { $addToSet: '$resource' },
            uniqueIPs: { $addToSet: '$ipAddress' }
          }
        },
        {
          $addFields: {
            riskScore: {
              $add: [
                { $multiply: [{ $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'critical'] } } } }, 10] },
                { $multiply: [{ $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'high'] } } } }, 5] },
                { $multiply: [{ $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'medium'] } } } }, 2] },
                { $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'low'] } } } }
              ]
            },
            failureRate: {
              $multiply: [
                { $divide: ['$failedActions', '$totalActions'] },
                100
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $sort: { riskScore: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$resource',
            totalAccess: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            riskEvents: {
              $sum: {
                $cond: [
                  { $in: ['$riskLevel', ['high', 'critical']] },
                  1,
                  0
                ]
              }
            },
            failedAccess: {
              $sum: { $cond: [{ $eq: ['$outcome', 'failure'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            riskScore: {
              $add: [
                { $multiply: ['$riskEvents', 5] },
                { $multiply: ['$failedAccess', 2] }
              ]
            },
            accessPattern: {
              $divide: ['$totalAccess', { $size: '$uniqueUsers' }]
            }
          }
        },
        { $sort: { riskScore: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          analysisDate: new Date(),
          period: { from: dateFrom, to: dateTo },
          totalSuspiciousActivities: suspiciousActivities.length,
          highRiskUsers: userRiskProfiles.filter(u => u.riskScore > 50).length,
          criticalResources: resourceRisks.filter(r => r.riskScore > 20).length
        },
        riskTrends,
        suspiciousActivities,
        userRiskProfiles,
        resourceRisks
      }
    });
  } catch (error) {
    console.error('Get risk analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform risk analysis',
      error: error.message
    });
  }
};

// Export audit logs
export const exportAuditLogs = async (req, res) => {
  try {
    const { format = 'json', dateFrom, dateTo, ...filters } = req.query;
    const labId = req.user.labId;

    const query = { labId };
    
    // Apply date filter
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }

    // Apply other filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'format') {
        query[key] = filters[key];
      }
    });

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .populate('target.id', 'name email')
      .sort({ timestamp: -1 })
      .limit(10000); // Limit for performance

    if (format === 'csv') {
      const csvHeaders = [
        'Timestamp', 'User', 'Action', 'Resource', 'Target', 'Risk Level',
        'Outcome', 'IP Address', 'Description', 'Compliance Required'
      ];
      
      const csvRows = logs.map(log => [
        log.timestamp.toISOString(),
        log.userId?.name || 'System',
        log.action,
        log.resource,
        log.target?.name || log.target?.id || '',
        log.riskLevel,
        log.outcome,
        log.ipAddress,
        log.description,
        log.compliance?.required ? 'Yes' : 'No'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.send(csvContent);
    }

    const exportData = {
      exportedAt: new Date(),
      exportedBy: req.user.name,
      filters,
      totalLogs: logs.length,
      logs
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs',
      error: error.message
    });
  }
};

// Archive old logs
export const archiveOldLogs = async (req, res) => {
  try {
    const { olderThanDays = 365 } = req.body;
    const labId = req.user.labId;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));

    const result = await AuditLog.archiveOldLogs(labId, cutoffDate);

    res.json({
      success: true,
      message: 'Old logs archived successfully',
      data: {
        archivedCount: result.archivedCount,
        cutoffDate
      }
    });
  } catch (error) {
    console.error('Archive old logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive old logs',
      error: error.message
    });
  }
};

export default {
  getAuditLogs,
  getAuditLog,
  createAuditLog,
  getAuditStats,
  getComplianceReport,
  getRiskAnalysis,
  exportAuditLogs,
  archiveOldLogs
};