import Test from '../models/Test.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all tests with filtering and pagination
export const getTests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      department,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      priceMin,
      priceMax,
      turnaroundMax,
      isActive
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (category) query.category = category;
    if (department) query.department = department;
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'methodology.technique': { $regex: search, $options: 'i' } },
        { 'parameters.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (priceMin || priceMax) {
      query['pricing.basePrice'] = {};
      if (priceMin) query['pricing.basePrice'].$gte = parseFloat(priceMin);
      if (priceMax) query['pricing.basePrice'].$lte = parseFloat(priceMax);
    }

    // Turnaround time filter
    if (turnaroundMax) {
      query['turnaroundTime.standard'] = { $lte: parseInt(turnaroundMax) };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tests, total] = await Promise.all([
      Test.find(query)
        .populate('department', 'name code')
        .populate('createdBy', 'name email')
        .populate('equipment.required', 'name model status')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Test.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tests',
      error: error.message
    });
  }
};

// Get single test
export const getTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID'
      });
    }

    const test = await Test.findOne({ _id: id, labId: req.user.labId })
      .populate('department', 'name code location contact')
      .populate('createdBy', 'name email role')
      .populate('equipment.required', 'name model manufacturer status location')
      .populate('reagents.item', 'name manufacturer lotNumber expiryDate');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test',
      error: error.message
    });
  }
};

// Create new test
export const createTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if test code already exists
    const existingTest = await Test.findOne({
      labId: req.user.labId,
      code: req.body.code
    });

    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: 'Test code already exists'
      });
    }

    const testData = {
      ...req.body,
      labId: req.user.labId,
      createdBy: req.user._id
    };

    const test = new Test(testData);
    await test.save();

    await test.populate([
      { path: 'department', select: 'name code' },
      { path: 'createdBy', select: 'name email' },
      { path: 'equipment.required', select: 'name model status' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test',
      error: error.message
    });
  }
};

// Update test
export const updateTest = async (req, res) => {
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
        message: 'Invalid test ID'
      });
    }

    const test = await Test.findOne({ _id: id, labId: req.user.labId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if test code is being changed and if it already exists
    if (req.body.code && req.body.code !== test.code) {
      const existingTest = await Test.findOne({
        labId: req.user.labId,
        code: req.body.code,
        _id: { $ne: id }
      });

      if (existingTest) {
        return res.status(400).json({
          success: false,
          message: 'Test code already exists'
        });
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedTest = await Test.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'department', select: 'name code' },
      { path: 'createdBy', select: 'name email' },
      { path: 'equipment.required', select: 'name model status' }
    ]);

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: updatedTest
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test',
      error: error.message
    });
  }
};

// Delete test
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID'
      });
    }

    const test = await Test.findOne({ _id: id, labId: req.user.labId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if test is being used in any samples or reports
    const Sample = mongoose.model('Sample');
    const Report = mongoose.model('Report');
    
    const [samplesUsingTest, reportsUsingTest] = await Promise.all([
      Sample.countDocuments({ 'tests.testId': id }),
      Report.countDocuments({ 'tests.testId': id })
    ]);

    if (samplesUsingTest > 0 || reportsUsingTest > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete test. It is being used in samples or reports.',
        data: {
          samplesCount: samplesUsingTest,
          reportsCount: reportsUsingTest
        }
      });
    }

    await Test.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete test',
      error: error.message
    });
  }
};

// Get test categories
export const getTestCategories = async (req, res) => {
  try {
    const categories = await Test.aggregate([
      { $match: { labId: req.user.labId, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.basePrice' },
          avgTurnaround: { $avg: '$turnaroundTime.standard' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get test categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test categories',
      error: error.message
    });
  }
};

// Get test statistics
export const getTestStats = async (req, res) => {
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

    const [totalTests, statusStats, categoryStats, departmentStats, priceStats, popularTests] = await Promise.all([
      Test.countDocuments(baseQuery),
      Test.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Test.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricing.basePrice' },
            totalRevenue: { $sum: { $multiply: ['$statistics.totalOrders', '$pricing.basePrice'] } }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Test.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricing.basePrice' }
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
      Test.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$pricing.basePrice' },
            minPrice: { $min: '$pricing.basePrice' },
            maxPrice: { $max: '$pricing.basePrice' },
            totalRevenue: { $sum: { $multiply: ['$statistics.totalOrders', '$pricing.basePrice'] } }
          }
        }
      ]),
      Test.aggregate([
        { $match: baseQuery },
        {
          $sort: { 'statistics.totalOrders': -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            name: 1,
            code: 1,
            category: 1,
            totalOrders: '$statistics.totalOrders',
            revenue: { $multiply: ['$statistics.totalOrders', '$pricing.basePrice'] },
            avgRating: '$statistics.averageRating'
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalTests,
          activeTests: statusStats.find(s => s._id === 'active')?.count || 0,
          inactiveTests: statusStats.find(s => s._id === 'inactive')?.count || 0,
          draftTests: statusStats.find(s => s._id === 'draft')?.count || 0
        },
        categoryBreakdown: categoryStats,
        departmentBreakdown: departmentStats,
        pricing: priceStats[0] || {
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          totalRevenue: 0
        },
        popularTests
      }
    });
  } catch (error) {
    console.error('Get test stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test statistics',
      error: error.message
    });
  }
};

// Update test pricing
export const updateTestPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { basePrice, urgentPrice, discounts, currency } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID'
      });
    }

    const test = await Test.findOne({ _id: id, labId: req.user.labId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    const pricingUpdate = {
      'pricing.basePrice': basePrice,
      'pricing.urgentPrice': urgentPrice,
      'pricing.discounts': discounts,
      'pricing.currency': currency,
      'pricing.lastUpdated': new Date(),
      updatedAt: new Date()
    };

    const updatedTest = await Test.findByIdAndUpdate(
      id,
      pricingUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Test pricing updated successfully',
      data: {
        id: updatedTest._id,
        name: updatedTest.name,
        pricing: updatedTest.pricing
      }
    });
  } catch (error) {
    console.error('Update test pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test pricing',
      error: error.message
    });
  }
};

// Bulk update tests
export const bulkUpdateTests = async (req, res) => {
  try {
    const { testIds, updates } = req.body;

    if (!Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Test IDs array is required'
      });
    }

    // Validate all test IDs
    const invalidIds = testIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test IDs found',
        data: { invalidIds }
      });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await Test.updateMany(
      {
        _id: { $in: testIds },
        labId: req.user.labId
      },
      updateData
    );

    res.json({
      success: true,
      message: 'Tests updated successfully',
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tests',
      error: error.message
    });
  }
};

// Get test quality control data
export const getTestQualityControl = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateFrom, dateTo } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID'
      });
    }

    const test = await Test.findOne({ _id: id, labId: req.user.labId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    let qcData = test.qualityControl;

    // Filter QC records by date if provided
    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);

      qcData = {
        ...qcData.toObject(),
        records: qcData.records.filter(record => {
          const recordDate = new Date(record.date);
          if (dateFrom && recordDate < new Date(dateFrom)) return false;
          if (dateTo && recordDate > new Date(dateTo)) return false;
          return true;
        })
      };
    }

    // Calculate QC statistics
    const qcStats = {
      totalRecords: qcData.records.length,
      passedRecords: qcData.records.filter(r => r.result === 'pass').length,
      failedRecords: qcData.records.filter(r => r.result === 'fail').length,
      warningRecords: qcData.records.filter(r => r.result === 'warning').length,
      passRate: 0
    };

    if (qcStats.totalRecords > 0) {
      qcStats.passRate = (qcStats.passedRecords / qcStats.totalRecords) * 100;
    }

    res.json({
      success: true,
      data: {
        testInfo: {
          id: test._id,
          name: test.name,
          code: test.code
        },
        qualityControl: qcData,
        statistics: qcStats
      }
    });
  } catch (error) {
    console.error('Get test quality control error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quality control data',
      error: error.message
    });
  }
};

export default {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  getTestCategories,
  getTestStats,
  updateTestPricing,
  bulkUpdateTests,
  getTestQualityControl
};