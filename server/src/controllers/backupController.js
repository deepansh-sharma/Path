import BackupJob from '../models/BackupJob.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

// Get all backup jobs with filtering and pagination
export const getBackupJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      priority,
      tag
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (tag) query.tags = { $in: [tag] };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'source.path': { $regex: search, $options: 'i' } },
        { 'destination.path': { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      BackupJob.find(query)
        .populate('createdBy', 'name email role')
        .populate('lastExecutedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      BackupJob.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get backup jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch backup jobs',
      error: error.message
    });
  }
};

// Get single backup job
export const getBackupJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup job ID'
      });
    }

    const job = await BackupJob.findOne({ _id: id, labId: req.user.labId })
      .populate('createdBy', 'name email role phone')
      .populate('lastExecutedBy', 'name email')
      .populate('dependencies.jobId', 'name status');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Backup job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get backup job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch backup job',
      error: error.message
    });
  }
};

// Create new backup job
export const createBackupJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const jobData = {
      ...req.body,
      labId: req.user.labId,
      createdBy: req.user._id
    };

    // Validate source path exists (if local)
    if (jobData.source?.type === 'local' && jobData.source?.path) {
      try {
        await fs.access(jobData.source.path);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Source path does not exist or is not accessible'
        });
      }
    }

    const job = new BackupJob(jobData);
    await job.save();

    await job.populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Backup job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create backup job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup job',
      error: error.message
    });
  }
};

// Update backup job
export const updateBackupJob = async (req, res) => {
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
        message: 'Invalid backup job ID'
      });
    }

    const job = await BackupJob.findOne({ _id: id, labId: req.user.labId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Backup job not found'
      });
    }

    // Don't allow updating running jobs
    if (job.status === 'running') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a running backup job'
      });
    }

    // Validate source path if being updated
    if (req.body.source?.type === 'local' && req.body.source?.path) {
      try {
        await fs.access(req.body.source.path);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Source path does not exist or is not accessible'
        });
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedJob = await BackupJob.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    res.json({
      success: true,
      message: 'Backup job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Update backup job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update backup job',
      error: error.message
    });
  }
};

// Delete backup job
export const deleteBackupJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup job ID'
      });
    }

    const job = await BackupJob.findOne({ _id: id, labId: req.user.labId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Backup job not found'
      });
    }

    // Don't allow deleting running jobs
    if (job.status === 'running') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a running backup job. Stop it first.'
      });
    }

    // Check if other jobs depend on this one
    const dependentJobs = await BackupJob.find({
      labId: req.user.labId,
      'dependencies.jobId': id
    });

    if (dependentJobs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete backup job. Other jobs depend on it.',
        data: {
          dependentJobs: dependentJobs.map(j => ({ id: j._id, name: j.name }))
        }
      });
    }

    await BackupJob.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Backup job deleted successfully'
    });
  } catch (error) {
    console.error('Delete backup job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup job',
      error: error.message
    });
  }
};

// Execute backup job manually
export const executeBackupJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup job ID'
      });
    }

    const job = await BackupJob.findOne({ _id: id, labId: req.user.labId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Backup job not found'
      });
    }

    if (job.status === 'running') {
      return res.status(400).json({
        success: false,
        message: 'Backup job is already running'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Backup job is disabled'
      });
    }

    // Start the backup job execution
    const executionResult = await job.execute(req.user._id);

    res.json({
      success: true,
      message: 'Backup job execution started',
      data: {
        executionId: executionResult.executionId,
        status: 'running',
        startedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Execute backup job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute backup job',
      error: error.message
    });
  }
};

// Stop running backup job
export const stopBackupJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup job ID'
      });
    }

    const job = await BackupJob.findOne({ _id: id, labId: req.user.labId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Backup job not found'
      });
    }

    if (job.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: 'Backup job is not currently running'
      });
    }

    // Stop the backup job
    await job.stop(req.user._id);

    res.json({
      success: true,
      message: 'Backup job stopped successfully'
    });
  } catch (error) {
    console.error('Stop backup job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop backup job',
      error: error.message
    });
  }
};

// Get backup job execution history
export const getExecutionHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup job ID'
      });
    }

    const job = await BackupJob.findOne({ _id: id, labId: req.user.labId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Backup job not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalExecutions = job.execution.history.length;
    
    const history = job.execution.history
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(skip, skip + parseInt(limit));

    // Populate user information for each execution
    const populatedHistory = await Promise.all(
      history.map(async (execution) => {
        if (execution.executedBy) {
          const user = await mongoose.model('User').findById(execution.executedBy, 'name email role');
          return { ...execution.toObject(), executedBy: user };
        }
        return execution;
      })
    );

    res.json({
      success: true,
      data: {
        history: populatedHistory,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalExecutions / parseInt(limit)),
          total: totalExecutions,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get execution history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch execution history',
      error: error.message
    });
  }
};

// Get backup statistics
export const getBackupStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const labId = req.user.labId;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    const baseQuery = { labId, ...dateFilter };

    const [totalJobs, statusStats, typeStats, sizeStats, recentExecutions, failureAnalysis] = await Promise.all([
      BackupJob.countDocuments(baseQuery),
      BackupJob.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      BackupJob.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgSize: { $avg: '$result.backupSize' },
            totalSize: { $sum: '$result.backupSize' }
          }
        }
      ]),
      BackupJob.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            totalBackupSize: { $sum: '$result.backupSize' },
            avgBackupSize: { $avg: '$result.backupSize' },
            maxBackupSize: { $max: '$result.backupSize' },
            minBackupSize: { $min: '$result.backupSize' }
          }
        }
      ]),
      BackupJob.aggregate([
        { $match: baseQuery },
        { $unwind: '$execution.history' },
        {
          $match: {
            'execution.history.startedAt': {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$execution.history.startedAt'
              }
            },
            executions: { $sum: 1 },
            successful: {
              $sum: {
                $cond: [{ $eq: ['$execution.history.status', 'completed'] }, 1, 0]
              }
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ['$execution.history.status', 'failed'] }, 1, 0]
              }
            },
            totalSize: { $sum: '$execution.history.backupSize' },
            avgDuration: { $avg: '$execution.history.duration' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      BackupJob.aggregate([
        { $match: baseQuery },
        { $unwind: '$execution.history' },
        {
          $match: {
            'execution.history.status': 'failed'
          }
        },
        {
          $group: {
            _id: '$execution.history.error.code',
            count: { $sum: 1 },
            examples: { $push: '$execution.history.error.message' },
            jobs: { $addToSet: { id: '$_id', name: '$name' } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const successRate = recentExecutions.reduce((acc, day) => {
      return acc + (day.executions > 0 ? (day.successful / day.executions) * 100 : 0);
    }, 0) / (recentExecutions.length || 1);

    res.json({
      success: true,
      data: {
        overview: {
          totalJobs,
          activeJobs: statusStats.find(s => s._id === 'active')?.count || 0,
          runningJobs: statusStats.find(s => s._id === 'running')?.count || 0,
          failedJobs: statusStats.find(s => s._id === 'failed')?.count || 0,
          successRate: Math.round(successRate * 100) / 100
        },
        statusBreakdown: statusStats,
        typeBreakdown: typeStats,
        sizeStats: sizeStats[0] || {
          totalBackupSize: 0,
          avgBackupSize: 0,
          maxBackupSize: 0,
          minBackupSize: 0
        },
        recentActivity: recentExecutions,
        commonFailures: failureAnalysis
      }
    });
  } catch (error) {
    console.error('Get backup stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch backup statistics',
      error: error.message
    });
  }
};

// Test backup configuration
export const testBackupConfig = async (req, res) => {
  try {
    const { source, destination, compression, encryption } = req.body;

    const testResults = {
      source: { valid: false, message: '' },
      destination: { valid: false, message: '' },
      compression: { valid: false, message: '' },
      encryption: { valid: false, message: '' }
    };

    // Test source accessibility
    try {
      if (source.type === 'local') {
        await fs.access(source.path);
        const stats = await fs.stat(source.path);
        testResults.source = {
          valid: true,
          message: `Source accessible. ${stats.isDirectory() ? 'Directory' : 'File'} found.`,
          size: stats.size,
          modified: stats.mtime
        };
      } else {
        testResults.source = {
          valid: true,
          message: 'Remote source configuration appears valid (full test requires connection)'
        };
      }
    } catch (error) {
      testResults.source = {
        valid: false,
        message: `Source not accessible: ${error.message}`
      };
    }

    // Test destination accessibility
    try {
      if (destination.type === 'local') {
        const destDir = path.dirname(destination.path);
        await fs.access(destDir);
        testResults.destination = {
          valid: true,
          message: 'Destination directory accessible'
        };
      } else {
        testResults.destination = {
          valid: true,
          message: 'Remote destination configuration appears valid (full test requires connection)'
        };
      }
    } catch (error) {
      testResults.destination = {
        valid: false,
        message: `Destination not accessible: ${error.message}`
      };
    }

    // Test compression settings
    if (compression?.enabled) {
      const validAlgorithms = ['gzip', 'bzip2', 'xz', 'lz4'];
      if (validAlgorithms.includes(compression.algorithm)) {
        testResults.compression = {
          valid: true,
          message: `Compression algorithm '${compression.algorithm}' is supported`
        };
      } else {
        testResults.compression = {
          valid: false,
          message: `Unsupported compression algorithm: ${compression.algorithm}`
        };
      }
    } else {
      testResults.compression = {
        valid: true,
        message: 'Compression disabled'
      };
    }

    // Test encryption settings
    if (encryption?.enabled) {
      const validAlgorithms = ['AES-256', 'AES-192', 'AES-128'];
      if (validAlgorithms.includes(encryption.algorithm)) {
        testResults.encryption = {
          valid: true,
          message: `Encryption algorithm '${encryption.algorithm}' is supported`
        };
      } else {
        testResults.encryption = {
          valid: false,
          message: `Unsupported encryption algorithm: ${encryption.algorithm}`
        };
      }
    } else {
      testResults.encryption = {
        valid: true,
        message: 'Encryption disabled'
      };
    }

    const overallValid = Object.values(testResults).every(result => result.valid);

    res.json({
      success: true,
      data: {
        overallValid,
        testResults,
        testedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Test backup config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test backup configuration',
      error: error.message
    });
  }
};

export default {
  getBackupJobs,
  getBackupJob,
  createBackupJob,
  updateBackupJob,
  deleteBackupJob,
  executeBackupJob,
  stopBackupJob,
  getExecutionHistory,
  getBackupStats,
  testBackupConfig
};