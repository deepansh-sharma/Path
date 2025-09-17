import express from 'express';
import { body, query, param } from 'express-validator';
import {
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
} from '../controllers/inventoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createInventoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('category')
    .isIn(['reagents', 'consumables', 'equipment', 'supplies', 'chemicals', 'media', 'kits', 'other'])
    .withMessage('Invalid category'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU must be between 1 and 50 characters'),
  body('currentStock')
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  body('minStock')
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('maxStock')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum stock must be a positive integer'),
  body('unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  body('supplier.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Supplier name must be between 1 and 100 characters'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('location.building')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Building must be between 1 and 50 characters'),
  body('location.room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters')
];

const updateInventoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('category')
    .optional()
    .isIn(['reagents', 'consumables', 'equipment', 'supplies', 'chemicals', 'media', 'kits', 'other'])
    .withMessage('Invalid category'),
  body('currentStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number')
];

const stockUpdateValidation = [
  body('quantity')
    .isInt()
    .withMessage('Quantity must be an integer'),
  body('type')
    .isIn(['add', 'remove', 'set'])
    .withMessage('Type must be add, remove, or set'),
  body('reason')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Reason must be between 1 and 200 characters'),
  body('batchNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Batch number must be between 1 and 50 characters')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'category', 'currentStock', 'minStock', 'unitPrice', 'expiryDate', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  // Advanced search parameters
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isIn(['reagents', 'consumables', 'equipment', 'supplies', 'chemicals', 'media', 'kits', 'other'])
    .withMessage('Invalid category'),
  query('stockLevel')
    .optional()
    .isIn(['low', 'normal', 'high', 'out-of-stock'])
    .withMessage('Invalid stock level filter'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number'),
  query('supplier')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Supplier name must be between 1 and 100 characters'),
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be between 1 and 100 characters'),
  query('expiryDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Expiry date from must be a valid date'),
  query('expiryDateTo')
    .optional()
    .isISO8601()
    .withMessage('Expiry date to must be a valid date'),
  query('createdFrom')
    .optional()
    .isISO8601()
    .withMessage('Created from date must be a valid date'),
  query('createdTo')
    .optional()
    .isISO8601()
    .withMessage('Created to date must be a valid date')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid inventory item ID')
];

// Routes

// GET /api/inventory - Get all inventory items with filtering and pagination
router.get('/', 
  queryValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'inventory_manager']),
  getInventoryItems
);

// GET /api/inventory/stats - Get inventory statistics
router.get('/stats',
  authorize(['admin', 'lab_manager', 'inventory_manager']),
  getInventoryStats
);

// GET /api/inventory/low-stock - Get low stock items
router.get('/low-stock',
  authorize(['admin', 'lab_manager', 'technician', 'inventory_manager']),
  getLowStockItems
);

// GET /api/inventory/expiring - Get expiring items
router.get('/expiring',
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'inventory_manager']),
  getExpiringItems
);

// GET /api/inventory/report - Generate inventory report
router.get('/report',
  query('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Format must be json, csv, or pdf'),
  query('category')
    .optional()
    .isIn(['reagents', 'consumables', 'equipment', 'supplies', 'chemicals', 'media', 'kits', 'other'])
    .withMessage('Invalid category'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'inventory_manager']),
  generateInventoryReport
);

// GET /api/inventory/:id - Get single inventory item
router.get('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'inventory_manager']),
  getInventoryItem
);

// GET /api/inventory/:id/history - Get stock history for item
router.get('/:id/history',
  idValidation,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'inventory_manager']),
  getStockHistory
);

// POST /api/inventory - Create new inventory item
router.post('/',
  createInventoryValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'inventory_manager']),
  createInventoryItem
);

// POST /api/inventory/bulk-update - Bulk update inventory items
router.post('/bulk-update',
  body('items')
    .isArray({ min: 1, max: 100 })
    .withMessage('Items must be an array with 1-100 items'),
  body('items.*.id')
    .isMongoId()
    .withMessage('Invalid item ID'),
  body('operation')
    .isIn(['update', 'delete', 'stock-update'])
    .withMessage('Invalid operation'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'inventory_manager']),
  bulkUpdateInventory
);

// PUT /api/inventory/:id - Update inventory item
router.put('/:id',
  idValidation,
  updateInventoryValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'inventory_manager']),
  updateInventoryItem
);

// PATCH /api/inventory/:id/stock - Update stock quantity
router.patch('/:id/stock',
  idValidation,
  stockUpdateValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'inventory_manager']),
  updateStock
);

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'inventory_manager']),
  deleteInventoryItem
);

export default router;