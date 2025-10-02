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

// Clone test
export const cloneTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID'
      });
    }

    const originalTest = await Test.findOne({ _id: id, labId: req.user.labId });
    if (!originalTest) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if new code already exists
    if (code) {
      const existingTest = await Test.findOne({ code, labId: req.user.labId });
      if (existingTest) {
        return res.status(400).json({
          success: false,
          message: 'Test code already exists'
        });
      }
    }

    const testData = originalTest.toObject();
    delete testData._id;
    delete testData.createdAt;
    delete testData.updatedAt;
    delete testData.__v;

    // Update with new name and code
    testData.name = name || `${originalTest.name} (Copy)`;
    testData.code = code || `${originalTest.code}_COPY_${Date.now()}`;
    testData.status = 'draft';
    testData.isActive = false;
    testData.createdBy = req.user.id;
    testData.labId = req.user.labId;

    const clonedTest = new Test(testData);
    await clonedTest.save();

    await clonedTest.populate([
      { path: 'department', select: 'name code' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Test cloned successfully',
      data: clonedTest
    });
  } catch (error) {
    console.error('Clone test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clone test',
      error: error.message
    });
  }
};

// Toggle test status
export const toggleTestStatus = async (req, res) => {
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

    test.isActive = !test.isActive;
    test.status = test.isActive ? 'active' : 'inactive';
    test.updatedBy = req.user.id;
    await test.save();

    res.json({
      success: true,
      message: `Test ${test.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: test.isActive, status: test.status }
    });
  } catch (error) {
    console.error('Toggle test status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle test status',
      error: error.message
    });
  }
};

// Bulk delete tests
export const bulkDeleteTests = async (req, res) => {
  try {
    const { testIds } = req.body;

    const result = await Test.deleteMany({
      _id: { $in: testIds },
      labId: req.user.labId
    });

    res.json({
      success: true,
      message: `${result.deletedCount} tests deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Bulk delete tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tests',
      error: error.message
    });
  }
};

// Bulk update test status
export const bulkUpdateTestStatus = async (req, res) => {
  try {
    const { testIds, status } = req.body;

    const isActive = status === 'active';
    const result = await Test.updateMany(
      { _id: { $in: testIds }, labId: req.user.labId },
      { 
        status, 
        isActive,
        updatedBy: req.user.id,
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} tests updated successfully`,
      data: { modifiedCount: result.modifiedCount, status }
    });
  } catch (error) {
    console.error('Bulk update test status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test status',
      error: error.message
    });
  }
};

// Export tests to CSV or JSON
export const exportTests = async (req, res) => {
  try {
    const { testIds, format = 'csv' } = req.query;
    const labId = req.user.labId;

    let query = { labId };
    if (testIds) {
      const ids = testIds.split(',').map(id => id.trim());
      query._id = { $in: ids };
    }

    const tests = await Test.find(query)
      .populate('department', 'name')
      .populate('createdBy', 'name email')
      .lean();

    if (format === 'csv') {
      // Convert to CSV format with comprehensive test data
      const csvData = tests.map(test => ({
        'Test Code': test.code,
        'Test Name': test.name,
        'Category': test.category,
        'Department': test.department?.name || test.department,
        'Description': test.description || '',
        'Base Price': test.pricing?.basePrice || 0,
        'Urgent Price': test.pricing?.urgentPrice || 0,
        'Home Collection Price': test.pricing?.homeCollectionPrice || 0,
        'Discount Percentage': test.pricing?.discountPercentage || 0,
        'Standard TAT (hours)': test.turnaroundTime?.standard || 0,
        'Urgent TAT (hours)': test.turnaroundTime?.urgent || 0,
        'Specimen Type': test.specimen?.type || '',
        'Specimen Volume': test.specimen?.volume || '',
        'Specimen Container': test.specimen?.container || '',
        'Methodology': test.methodology?.technique || '',
        'Reference Range': test.referenceRange?.normal || '',
        'Status': test.status,
        'Active': test.isActive ? 'Yes' : 'No',
        'Created By': test.createdBy?.name || '',
        'Created Date': test.createdAt ? new Date(test.createdAt).toLocaleDateString() : '',
        'Last Updated': test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : ''
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tests-export.csv');
      
      const csvHeaders = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.send(csvContent);
    } else {
      // JSON format with full test data
      const exportData = {
        exportedAt: new Date(),
        exportedBy: req.user.name,
        totalTests: tests.length,
        tests: tests
      };
      
      res.json({ success: true, data: exportData });
    }
  } catch (error) {
    console.error('Export tests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export tests',
      error: error.message 
    });
  }
};

// Import tests from CSV or JSON file
export const importTests = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const labId = req.user.labId;
    const results = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;

    // Determine file type and process accordingly
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      // Process CSV file
      const csv = await import('csv-parser');
      const fs = await import('fs');
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv.default())
          .on('data', async (row) => {
            processedCount++;
            try {
              // Validate required fields
              if (!row['Test Code'] || !row['Test Name'] || !row['Category']) {
                errors.push({
                  row: processedCount,
                  data: row,
                  message: 'Missing required fields: Test Code, Test Name, or Category'
                });
                return;
              }

              // Check if test code already exists
              const existingTest = await Test.findOne({ 
                code: row['Test Code'].toUpperCase(), 
                labId 
              });
              
              if (existingTest) {
                errors.push({
                  row: processedCount,
                  data: row,
                  message: `Test code ${row['Test Code']} already exists`
                });
                return;
              }

              // Create test object from CSV data
              const testData = {
                code: row['Test Code'].toUpperCase(),
                name: row['Test Name'],
                category: row['Category'],
                department: row['Department'] || 'general',
                description: row['Description'] || '',
                pricing: {
                  basePrice: parseFloat(row['Base Price']) || 0,
                  urgentPrice: parseFloat(row['Urgent Price']) || 0,
                  homeCollectionPrice: parseFloat(row['Home Collection Price']) || 0,
                  discountPercentage: parseFloat(row['Discount Percentage']) || 0
                },
                turnaroundTime: {
                  standard: parseInt(row['Standard TAT (hours)']) || 24,
                  urgent: parseInt(row['Urgent TAT (hours)']) || 12
                },
                specimen: {
                  type: row['Specimen Type'] || 'blood',
                  volume: row['Specimen Volume'] || '',
                  container: row['Specimen Container'] || ''
                },
                methodology: {
                  technique: row['Methodology'] || ''
                },
                referenceRange: {
                  normal: row['Reference Range'] || ''
                },
                status: row['Status'] || 'active',
                isActive: row['Active'] === 'Yes' || row['Active'] === 'true' || true,
                labId,
                createdBy: req.user._id
              };

              const test = new Test(testData);
              await test.save();
              
              results.push({
                row: processedCount,
                testCode: test.code,
                testName: test.name,
                status: 'success'
              });
              successCount++;

            } catch (error) {
              errors.push({
                row: processedCount,
                data: row,
                message: error.message
              });
            }
          })
          .on('end', () => {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            
            resolve(res.json({
              success: true,
              message: `Import completed. ${successCount} tests imported successfully.`,
              data: {
                totalProcessed: processedCount,
                successCount,
                errorCount: errors.length,
                results,
                errors: errors.slice(0, 10) // Limit errors shown
              }
            }));
          })
          .on('error', (error) => {
            reject(res.status(500).json({
              success: false,
              message: 'Failed to process CSV file',
              error: error.message
            }));
          });
      });
      
    } else if (fileExtension === 'json') {
      // Process JSON file
      const fs = await import('fs');
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      if (!Array.isArray(jsonData.tests)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON format. Expected { tests: [...] }'
        });
      }

      for (const [index, testData] of jsonData.tests.entries()) {
        processedCount++;
        try {
          // Validate required fields
          if (!testData.code || !testData.name || !testData.category) {
            errors.push({
              row: index + 1,
              data: testData,
              message: 'Missing required fields: code, name, or category'
            });
            continue;
          }

          // Check if test code already exists
          const existingTest = await Test.findOne({ 
            code: testData.code.toUpperCase(), 
            labId 
          });
          
          if (existingTest) {
            errors.push({
              row: index + 1,
              data: testData,
              message: `Test code ${testData.code} already exists`
            });
            continue;
          }

          const test = new Test({
            ...testData,
            code: testData.code.toUpperCase(),
            labId,
            createdBy: req.user._id
          });
          
          await test.save();
          
          results.push({
            row: index + 1,
            testCode: test.code,
            testName: test.name,
            status: 'success'
          });
          successCount++;

        } catch (error) {
          errors.push({
            row: index + 1,
            data: testData,
            message: error.message
          });
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        message: `Import completed. ${successCount} tests imported successfully.`,
        data: {
          totalProcessed: processedCount,
          successCount,
          errorCount: errors.length,
          results,
          errors: errors.slice(0, 10) // Limit errors shown
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Please upload CSV or JSON files only.'
      });
    }

  } catch (error) {
    console.error('Import tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import tests',
      error: error.message
    });
  }
};

// Get popular tests
export const getPopularTests = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // This would typically be based on usage statistics
    // For now, return most recently created active tests
    const tests = await Test.find({ 
      labId: req.user.labId, 
      isActive: true 
    })
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: tests
    });
  } catch (error) {
    console.error('Get popular tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular tests',
      error: error.message
    });
  }
};

// Search tests
export const searchTests = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    const tests = await Test.find({
      labId: req.user.labId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('department', 'name code')
      .limit(parseInt(limit))
      .select('name code category description pricing.basePrice turnaroundTime.standard');

    res.json({
      success: true,
      data: tests
    });
  } catch (error) {
    console.error('Search tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search tests',
      error: error.message
    });
  }
};

// Get departments
export const getDepartments = async (req, res) => {
  try {
    // This would typically come from a Department model
    const departments = [
      { _id: '1', name: 'Hematology', code: 'HEMA' },
      { _id: '2', name: 'Biochemistry', code: 'BIOC' },
      { _id: '3', name: 'Microbiology', code: 'MICR' },
      { _id: '4', name: 'Immunology', code: 'IMMU' },
      { _id: '5', name: 'Molecular Biology', code: 'MOLB' }
    ];

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
};

// Get specimen types
export const getSpecimenTypes = async (req, res) => {
  try {
    const specimenTypes = [
      { value: 'blood', label: 'Blood', container: 'EDTA tube' },
      { value: 'serum', label: 'Serum', container: 'SST tube' },
      { value: 'plasma', label: 'Plasma', container: 'Heparin tube' },
      { value: 'urine', label: 'Urine', container: 'Sterile container' },
      { value: 'stool', label: 'Stool', container: 'Stool container' },
      { value: 'saliva', label: 'Saliva', container: 'Saliva tube' },
      { value: 'csf', label: 'CSF', container: 'Sterile tube' },
      { value: 'tissue', label: 'Tissue', container: 'Formalin container' },
      { value: 'swab', label: 'Swab', container: 'Transport medium' },
      { value: 'sputum', label: 'Sputum', container: 'Sterile container' }
    ];

    res.json({
      success: true,
      data: specimenTypes
    });
  } catch (error) {
    console.error('Get specimen types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specimen types',
      error: error.message
    });
  }
};

// Validate test code
export const validateTestCode = async (req, res) => {
  try {
    const { code } = req.body;

    const existingTest = await Test.findOne({ 
      code, 
      labId: req.user.labId 
    });

    res.json({
      success: true,
      data: {
        isAvailable: !existingTest,
        code
      }
    });
  } catch (error) {
    console.error('Validate test code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate test code',
      error: error.message
    });
  }
};

// Get test templates
export const getTestTemplates = async (req, res) => {
  try {
    // This would typically come from a TestTemplate model
    const templates = [
      {
        _id: '1',
        name: 'Basic Blood Chemistry',
        category: 'biochemistry',
        parameters: ['Glucose', 'Urea', 'Creatinine']
      },
      {
        _id: '2',
        name: 'Complete Blood Count',
        category: 'hematology',
        parameters: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit']
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get test templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test templates',
      error: error.message
    });
  }
};

// Get test reagents
export const getTestReagents = async (req, res) => {
  try {
    // This would typically come from a Reagent model
    const reagents = [
      {
        _id: '1',
        name: 'Glucose Reagent',
        code: 'GLU-001',
        supplier: 'Lab Supplies Inc',
        unitCost: 25.50
      },
      {
        _id: '2',
        name: 'Hemoglobin Reagent',
        code: 'HGB-001',
        supplier: 'Medical Reagents Co',
        unitCost: 18.75
      }
    ];

    res.json({
      success: true,
      data: reagents
    });
  } catch (error) {
    console.error('Get test reagents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test reagents',
      error: error.message
    });
  }
};

// Get test history
export const getTestHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID'
      });
    }

    // This would typically come from an audit log or version history
    const history = [
      {
        _id: '1',
        action: 'created',
        user: { name: 'John Doe', email: 'john@example.com' },
        timestamp: new Date(),
        changes: { status: 'draft' }
      },
      {
        _id: '2',
        action: 'updated',
        user: { name: 'Jane Smith', email: 'jane@example.com' },
        timestamp: new Date(Date.now() - 86400000),
        changes: { pricing: { basePrice: 50 } }
      }
    ];

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test history',
      error: error.message
    });
  }
};

// Submit test for approval
export const submitTestForApproval = async (req, res) => {
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

    if (test.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft tests can be submitted for approval'
      });
    }

    test.status = 'pending_approval';
    test.submittedForApprovalAt = new Date();
    test.submittedBy = req.user.id;
    await test.save();

    res.json({
      success: true,
      message: 'Test submitted for approval successfully',
      data: { status: test.status }
    });
  } catch (error) {
    console.error('Submit test for approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test for approval',
      error: error.message
    });
  }
};

// Approve test
export const approveTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

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

    if (test.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Only tests pending approval can be approved'
      });
    }

    test.status = 'active';
    test.isActive = true;
    test.approvedAt = new Date();
    test.approvedBy = req.user.id;
    if (comments) test.approvalComments = comments;
    await test.save();

    res.json({
      success: true,
      message: 'Test approved successfully',
      data: { status: test.status, isActive: test.isActive }
    });
  } catch (error) {
    console.error('Approve test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve test',
      error: error.message
    });
  }
};

// Reject test
export const rejectTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comments } = req.body;

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

    if (test.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Only tests pending approval can be rejected'
      });
    }

    test.status = 'draft';
    test.isActive = false;
    test.rejectedAt = new Date();
    test.rejectedBy = req.user.id;
    test.rejectionReason = reason;
    if (comments) test.rejectionComments = comments;
    await test.save();

    res.json({
      success: true,
      message: 'Test rejected successfully',
      data: { 
        status: test.status, 
        isActive: test.isActive,
        rejectionReason: reason
      }
    });
  } catch (error) {
    console.error('Reject test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject test',
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
  getTestQualityControl,
  cloneTest,
  toggleTestStatus,
  bulkDeleteTests,
  bulkUpdateTestStatus,
  exportTests,
  importTests,
  getPopularTests,
  searchTests,
  getDepartments,
  getSpecimenTypes,
  validateTestCode,
  getTestTemplates,
  getTestReagents,
  getTestHistory,
  submitTestForApproval,
  approveTest,
  rejectTest
};