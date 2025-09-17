import Inventory from '../models/Inventory.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all inventory items with filtering and pagination
export const getInventoryItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      stockLevel,
      minPrice,
      maxPrice,
      supplier,
      location,
      expiryDateFrom,
      expiryDateTo,
      createdFrom,
      createdTo,
      lowStock = false,
      expiringSoon = false
    } = req.query;

    const query = { labId: req.user.labId };

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    
    // Text search across multiple fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Stock level filters
    if (stockLevel) {
      switch (stockLevel) {
        case 'out-of-stock':
          query.currentStock = 0;
          break;
        case 'low':
          query.$expr = { $and: [{ $gt: ['$currentStock', 0] }, { $lte: ['$currentStock', '$minStock'] }] };
          break;
        case 'normal':
          query.$expr = { $and: [{ $gt: ['$currentStock', '$minStock'] }, { $lt: ['$currentStock', { $multiply: ['$minStock', 2] }] }] };
          break;
        case 'high':
          query.$expr = { $gte: ['$currentStock', { $multiply: ['$minStock', 2] }] };
          break;
      }
    }

    // Price range filters
    if (minPrice || maxPrice) {
      query.unitPrice = {};
      if (minPrice) query.unitPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.unitPrice.$lte = parseFloat(maxPrice);
    }

    // Supplier filter
    if (supplier) {
      query['supplier.name'] = { $regex: supplier, $options: 'i' };
    }

    // Location filter
    if (location) {
      query.$or = [
        { 'location.building': { $regex: location, $options: 'i' } },
        { 'location.room': { $regex: location, $options: 'i' } },
        { 'location.shelf': { $regex: location, $options: 'i' } }
      ];
    }

    // Expiry date range filters
    if (expiryDateFrom || expiryDateTo) {
      query.expiryDate = {};
      if (expiryDateFrom) query.expiryDate.$gte = new Date(expiryDateFrom);
      if (expiryDateTo) query.expiryDate.$lte = new Date(expiryDateTo);
    }

    // Created date range filters
    if (createdFrom || createdTo) {
      query.createdAt = {};
      if (createdFrom) query.createdAt.$gte = new Date(createdFrom);
      if (createdTo) query.createdAt.$lte = new Date(createdTo);
    }

    // Legacy filters for backward compatibility
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minStock'] };
    }

    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query.expiryDate = { $lte: thirtyDaysFromNow, $gte: new Date() };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Inventory.find(query)
        .populate('supplier', 'name contact email')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Inventory.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory items',
      error: error.message
    });
  }
};

// Get single inventory item
export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    const item = await Inventory.findOne({ _id: id, labId: req.user.labId })
      .populate('supplier', 'name contact email address')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item',
      error: error.message
    });
  }
};

// Create new inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const itemData = {
      ...req.body,
      labId: req.user.labId,
      createdBy: req.user._id
    };

    const item = new Inventory(itemData);
    await item.save();

    await item.populate([
      { path: 'supplier', select: 'name contact email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists in this lab'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
};

// Update inventory item
export const updateInventoryItem = async (req, res) => {
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
        message: 'Invalid inventory item ID'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const item = await Inventory.findOneAndUpdate(
      { _id: id, labId: req.user.labId },
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'supplier', select: 'name contact email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists in this lab'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    const item = await Inventory.findOneAndDelete({ _id: id, labId: req.user.labId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message
    });
  }
};

// Update stock levels
export const updateStock = async (req, res) => {
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
    const { quantity, type, reason, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    const item = await Inventory.findOne({ _id: id, labId: req.user.labId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Calculate new stock level
    let newStock;
    if (type === 'add') {
      newStock = item.currentStock + quantity;
    } else if (type === 'subtract') {
      newStock = Math.max(0, item.currentStock - quantity);
    } else {
      newStock = quantity; // direct set
    }

    // Add to stock history
    const stockEntry = {
      date: new Date(),
      type,
      quantity,
      previousStock: item.currentStock,
      newStock,
      reason,
      notes,
      performedBy: req.user._id
    };

    item.stockHistory.push(stockEntry);
    item.currentStock = newStock;
    item.updatedBy = req.user._id;

    await item.save();

    await item.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        item,
        stockEntry
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Inventory.find({
        labId: req.user.labId,
        $expr: { $lte: ['$currentStock', '$reorderLevel'] },
        status: 'active'
      })
        .populate('supplier', 'name contact email')
        .sort({ currentStock: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Inventory.countDocuments({
        labId: req.user.labId,
        $expr: { $lte: ['$currentStock', '$reorderLevel'] },
        status: 'active'
      })
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock items',
      error: error.message
    });
  }
};

// Get expiring items
export const getExpiringItems = async (req, res) => {
  try {
    const { days = 30, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    const [items, total] = await Promise.all([
      Inventory.find({
        labId: req.user.labId,
        expiryDate: { $lte: expiryDate, $gte: new Date() },
        status: 'active'
      })
        .populate('supplier', 'name contact email')
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Inventory.countDocuments({
        labId: req.user.labId,
        expiryDate: { $lte: expiryDate, $gte: new Date() },
        status: 'active'
      })
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring items',
      error: error.message
    });
  }
};

// Get inventory statistics
export const getInventoryStats = async (req, res) => {
  try {
    const labId = req.user.labId;

    const [totalItems, lowStockCount, expiringCount, categoryStats, valueStats] = await Promise.all([
      Inventory.countDocuments({ labId, status: 'active' }),
      Inventory.countDocuments({
        labId,
        $expr: { $lte: ['$currentStock', '$reorderLevel'] },
        status: 'active'
      }),
      Inventory.countDocuments({
        labId,
        expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
        status: 'active'
      }),
      Inventory.aggregate([
        { $match: { labId: new mongoose.Types.ObjectId(labId), status: 'active' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$currentStock', '$unitCost'] } },
            lowStockItems: {
              $sum: {
                $cond: [{ $lte: ['$currentStock', '$reorderLevel'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Inventory.aggregate([
        { $match: { labId: new mongoose.Types.ObjectId(labId), status: 'active' } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$currentStock', '$unitCost'] } },
            averageValue: { $avg: { $multiply: ['$currentStock', '$unitCost'] } }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalItems,
          lowStockCount,
          expiringCount,
          totalValue: valueStats[0]?.totalValue || 0,
          averageValue: valueStats[0]?.averageValue || 0
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory statistics',
      error: error.message
    });
  }
};

// Get stock history for an item
export const getStockHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID'
      });
    }

    const item = await Inventory.findOne({ _id: id, labId: req.user.labId })
      .populate('stockHistory.performedBy', 'name email')
      .select('name sku stockHistory');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Sort stock history by date (newest first)
    const sortedHistory = item.stockHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHistory = sortedHistory.slice(skip, skip + parseInt(limit));
    const total = sortedHistory.length;

    res.json({
      success: true,
      data: {
        item: {
          _id: item._id,
          name: item.name,
          sku: item.sku
        },
        history: paginatedHistory,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock history',
      error: error.message
    });
  }
};

// Bulk update inventory items
export const bulkUpdateInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, action } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and cannot be empty'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const itemUpdate of items) {
      try {
        const { id, ...updateData } = itemUpdate;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
          results.failed.push({ id, error: 'Invalid ID format' });
          continue;
        }

        let updatedItem;
        
        if (action === 'update') {
          updatedItem = await Inventory.findOneAndUpdate(
            { _id: id, labId: req.user.labId },
            { ...updateData, updatedBy: req.user._id },
            { new: true, runValidators: true }
          );
        } else if (action === 'delete') {
          updatedItem = await Inventory.findOneAndDelete({ _id: id, labId: req.user.labId });
        }

        if (updatedItem) {
          results.success.push({ id, item: updatedItem });
        } else {
          results.failed.push({ id, error: 'Item not found' });
        }
      } catch (error) {
        results.failed.push({ id: itemUpdate.id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: results
    });
  } catch (error) {
    console.error('Bulk update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk update',
      error: error.message
    });
  }
};

// Generate inventory report
export const generateInventoryReport = async (req, res) => {
  try {
    const { format = 'json', category, status, includeHistory = false } = req.query;
    const labId = req.user.labId;

    const query = { labId };
    if (category) query.category = category;
    if (status) query.status = status;

    let items;
    if (includeHistory === 'true') {
      items = await Inventory.find(query)
        .populate('supplier', 'name contact email')
        .populate('createdBy', 'name email')
        .populate('stockHistory.performedBy', 'name email')
        .sort({ name: 1 });
    } else {
      items = await Inventory.find(query)
        .populate('supplier', 'name contact email')
        .populate('createdBy', 'name email')
        .select('-stockHistory')
        .sort({ name: 1 });
    }

    const reportData = {
      generatedAt: new Date(),
      generatedBy: req.user.name,
      filters: { category, status, includeHistory },
      totalItems: items.length,
      items
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Name', 'SKU', 'Category', 'Current Stock', 'Unit', 'Unit Cost',
        'Reorder Level', 'Status', 'Expiry Date', 'Supplier', 'Location'
      ];
      
      const csvRows = items.map(item => [
        item.name,
        item.sku,
        item.category,
        item.currentStock,
        item.unit,
        item.unitCost,
        item.reorderLevel,
        item.status,
        item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : '',
        item.supplier?.name || '',
        item.location?.shelf || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      return res.send(csvContent);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Generate inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
};

export default {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems,
  getExpiringItems,
  getInventoryStats,
  getStockHistory,
  bulkUpdateInventory,
  generateInventoryReport
};