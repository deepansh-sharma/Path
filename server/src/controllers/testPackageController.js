import TestPackage from '../models/TestPackage.js';
import Test from '../models/Test.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all test packages with filtering and pagination
export const getTestPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      priceMin,
      priceMax,
      isActive,
      isPromotional
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isPromotional !== undefined) query['promotion.isActive'] = isPromotional === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'tags': { $regex: search, $options: 'i' } },
        { 'keywords': { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (priceMin || priceMax) {
      query['pricing.packagePrice'] = {};
      if (priceMin) query['pricing.packagePrice'].$gte = parseFloat(priceMin);
      if (priceMax) query['pricing.packagePrice'].$lte = parseFloat(priceMax);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [packages, total] = await Promise.all([
      TestPackage.find(query)
        .populate('tests.testId', 'name code category pricing.basePrice')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      TestPackage.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        packages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get test packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test packages',
      error: error.message
    });
  }
};

// Get single test package
export const getTestPackage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const package = await TestPackage.findOne({ _id: id, labId: req.user.labId })
      .populate('tests.testId', 'name code category description pricing turnaroundTime')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Test package not found'
      });
    }

    res.json({
      success: true,
      data: package
    });
  } catch (error) {
    console.error('Get test package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test package',
      error: error.message
    });
  }
};

// Create new test package
export const createTestPackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if package code already exists
    const existingPackage = await TestPackage.findOne({
      labId: req.user.labId,
      code: req.body.code
    });

    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: 'Package code already exists'
      });
    }

    // Validate that all test IDs exist and belong to the lab
    if (req.body.tests && req.body.tests.length > 0) {
      const testIds = req.body.tests.map(t => t.testId);
      const existingTests = await Test.find({
        _id: { $in: testIds },
        labId: req.user.labId,
        isActive: true
      });

      if (existingTests.length !== testIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more tests not found or inactive'
        });
      }
    }

    const packageData = {
      ...req.body,
      labId: req.user.labId,
      createdBy: req.user._id
    };

    const testPackage = new TestPackage(packageData);
    
    // Calculate total individual price
    await testPackage.calculateTotalIndividualPrice();
    await testPackage.save();

    await testPackage.populate([
      { path: 'tests.testId', select: 'name code category pricing.basePrice' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Test package created successfully',
      data: testPackage
    });
  } catch (error) {
    console.error('Create test package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test package',
      error: error.message
    });
  }
};

// Update test package
export const updateTestPackage = async (req, res) => {
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
        message: 'Invalid package ID'
      });
    }

    const testPackage = await TestPackage.findOne({ _id: id, labId: req.user.labId });
    if (!testPackage) {
      return res.status(404).json({
        success: false,
        message: 'Test package not found'
      });
    }

    // Check if package code is being changed and if it already exists
    if (req.body.code && req.body.code !== testPackage.code) {
      const existingPackage = await TestPackage.findOne({
        labId: req.user.labId,
        code: req.body.code,
        _id: { $ne: id }
      });

      if (existingPackage) {
        return res.status(400).json({
          success: false,
          message: 'Package code already exists'
        });
      }
    }

    // Validate test IDs if tests are being updated
    if (req.body.tests && req.body.tests.length > 0) {
      const testIds = req.body.tests.map(t => t.testId);
      const existingTests = await Test.find({
        _id: { $in: testIds },
        labId: req.user.labId,
        isActive: true
      });

      if (existingTests.length !== testIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more tests not found or inactive'
        });
      }
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };

    const updatedPackage = await TestPackage.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Recalculate pricing if tests were updated
    if (req.body.tests) {
      await updatedPackage.calculateTotalIndividualPrice();
      await updatedPackage.save();
    }

    await updatedPackage.populate([
      { path: 'tests.testId', select: 'name code category pricing.basePrice' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Test package updated successfully',
      data: updatedPackage
    });
  } catch (error) {
    console.error('Update test package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test package',
      error: error.message
    });
  }
};

// Delete test package
export const deleteTestPackage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const testPackage = await TestPackage.findOne({ _id: id, labId: req.user.labId });
    if (!testPackage) {
      return res.status(404).json({
        success: false,
        message: 'Test package not found'
      });
    }

    // Check if package is being used in any samples or invoices
    const Sample = mongoose.model('Sample');
    const Invoice = mongoose.model('Invoice');
    
    const [samplesUsingPackage, invoicesUsingPackage] = await Promise.all([
      Sample.countDocuments({ 'packages.packageId': id }),
      Invoice.countDocuments({ 'items.packageId': id })
    ]);

    if (samplesUsingPackage > 0 || invoicesUsingPackage > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete package. It is being used in samples or invoices.',
        data: {
          samplesCount: samplesUsingPackage,
          invoicesCount: invoicesUsingPackage
        }
      });
    }

    await TestPackage.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Test package deleted successfully'
    });
  } catch (error) {
    console.error('Delete test package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete test package',
      error: error.message
    });
  }
};

// Add test to package
export const addTestToPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { testId, isOptional = false, customPrice } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package or test ID'
      });
    }

    const testPackage = await TestPackage.findOne({ _id: id, labId: req.user.labId });
    if (!testPackage) {
      return res.status(404).json({
        success: false,
        message: 'Test package not found'
      });
    }

    // Check if test exists and belongs to the lab
    const test = await Test.findOne({ _id: testId, labId: req.user.labId, isActive: true });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found or inactive'
      });
    }

    // Check if test is already in the package
    const existingTest = testPackage.tests.find(t => t.testId.toString() === testId);
    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: 'Test is already in this package'
      });
    }

    // Add test to package
    await testPackage.addTest(testId, isOptional, customPrice);

    await testPackage.populate('tests.testId', 'name code category pricing.basePrice');

    res.json({
      success: true,
      message: 'Test added to package successfully',
      data: testPackage
    });
  } catch (error) {
    console.error('Add test to package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add test to package',
      error: error.message
    });
  }
};

// Remove test from package
export const removeTestFromPackage = async (req, res) => {
  try {
    const { id, testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package or test ID'
      });
    }

    const testPackage = await TestPackage.findOne({ _id: id, labId: req.user.labId });
    if (!testPackage) {
      return res.status(404).json({
        success: false,
        message: 'Test package not found'
      });
    }

    // Remove test from package
    await testPackage.removeTest(testId);

    await testPackage.populate('tests.testId', 'name code category pricing.basePrice');

    res.json({
      success: true,
      message: 'Test removed from package successfully',
      data: testPackage
    });
  } catch (error) {
    console.error('Remove test from package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove test from package',
      error: error.message
    });
  }
};

// Update package pricing
export const updatePackagePricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { packagePrice, discountType, discountValue, currency } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const testPackage = await TestPackage.findOne({ _id: id, labId: req.user.labId });
    if (!testPackage) {
      return res.status(404).json({
        success: false,
        message: 'Test package not found'
      });
    }

    // Update pricing
    await testPackage.updatePrice(packagePrice, discountType, discountValue, currency);

    res.json({
      success: true,
      message: 'Package pricing updated successfully',
      data: {
        id: testPackage._id,
        name: testPackage.name,
        pricing: testPackage.pricing,
        savingsAmount: testPackage.savingsAmount,
        savingsPercentage: testPackage.savingsPercentage
      }
    });
  } catch (error) {
    console.error('Update package pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package pricing',
      error: error.message
    });
  }
};

// Get package categories
export const getPackageCategories = async (req, res) => {
  try {
    const categories = await TestPackage.aggregate([
      { $match: { labId: req.user.labId, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.packagePrice' },
          avgSavings: { $avg: '$pricing.totalIndividualPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get package categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package categories',
      error: error.message
    });
  }
};

// Get package statistics
export const getPackageStats = async (req, res) => {
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

    const [totalPackages, statusStats, categoryStats, popularPackages, promotionalStats] = await Promise.all([
      TestPackage.countDocuments(baseQuery),
      TestPackage.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      TestPackage.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricing.packagePrice' },
            totalRevenue: { $sum: { $multiply: ['$statistics.totalOrders', '$pricing.packagePrice'] } }
          }
        },
        { $sort: { count: -1 } }
      ]),
      TestPackage.aggregate([
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
            revenue: { $multiply: ['$statistics.totalOrders', '$pricing.packagePrice'] },
            avgRating: '$statistics.averageRating',
            testCount: { $size: '$tests' }
          }
        }
      ]),
      TestPackage.aggregate([
        { $match: { ...baseQuery, 'promotion.isActive': true } },
        {
          $group: {
            _id: null,
            activePromotions: { $sum: 1 },
            avgDiscount: { $avg: '$promotion.discountPercentage' },
            totalPromotionalRevenue: { $sum: { $multiply: ['$statistics.totalOrders', '$pricing.packagePrice'] } }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalPackages,
          activePackages: statusStats.find(s => s._id === 'active')?.count || 0,
          inactivePackages: statusStats.find(s => s._id === 'inactive')?.count || 0,
          draftPackages: statusStats.find(s => s._id === 'draft')?.count || 0
        },
        categoryBreakdown: categoryStats,
        popularPackages,
        promotionalStats: promotionalStats[0] || {
          activePromotions: 0,
          avgDiscount: 0,
          totalPromotionalRevenue: 0
        }
      }
    });
  } catch (error) {
    console.error('Get package stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package statistics',
      error: error.message
    });
  }
};

// Bulk update packages
export const bulkUpdatePackages = async (req, res) => {
  try {
    const { packageIds, updates } = req.body;

    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Package IDs array is required'
      });
    }

    // Validate all package IDs
    const validIds = packageIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== packageIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more invalid package IDs'
      });
    }

    const updateData = {
      ...updates,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };

    const result = await TestPackage.updateMany(
      { 
        _id: { $in: validIds },
        labId: req.user.labId
      },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} packages updated successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update packages',
      error: error.message
    });
  }
};