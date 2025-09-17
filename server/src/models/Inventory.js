import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['reagents', 'consumables', 'equipment', 'supplies'],
    index: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  supplier: {
    name: { type: String, required: true },
    contact: { type: String },
    email: { type: String },
    address: { type: String }
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock level cannot be negative'],
    default: 10
  },
  maxStockLevel: {
    type: Number,
    required: [true, 'Maximum stock level is required'],
    min: [0, 'Maximum stock level cannot be negative'],
    default: 100
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pieces', 'ml', 'liters', 'grams', 'kg', 'boxes', 'vials', 'tubes']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'INR', 'GBP']
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: function() {
      return ['reagents', 'consumables'].includes(this.category);
    }
  },
  location: {
    room: { type: String },
    shelf: { type: String },
    position: { type: String }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'recalled'],
    default: 'active',
    index: true
  },
  alerts: {
    lowStock: { type: Boolean, default: false },
    nearExpiry: { type: Boolean, default: false },
    expired: { type: Boolean, default: false }
  },
  usage: {
    dailyAverage: { type: Number, default: 0 },
    weeklyAverage: { type: Number, default: 0 },
    monthlyAverage: { type: Number, default: 0 }
  },
  qualityControl: {
    lastChecked: { type: Date },
    checkedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
      default: 'pending'
    },
    notes: { type: String }
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
inventorySchema.index({ labId: 1, category: 1 });
inventorySchema.index({ labId: 1, status: 1 });
inventorySchema.index({ labId: 1, 'alerts.lowStock': 1 });
inventorySchema.index({ labId: 1, expiryDate: 1 });
inventorySchema.index({ sku: 1, labId: 1 });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'out_of_stock';
  if (this.currentStock <= this.minStockLevel) return 'low_stock';
  if (this.currentStock >= this.maxStockLevel) return 'overstock';
  return 'normal';
});

// Virtual for expiry status
inventorySchema.virtual('expiryStatus').get(function() {
  if (!this.expiryDate) return 'no_expiry';
  
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
});

// Method to update stock
inventorySchema.methods.updateStock = function(quantity, operation = 'add') {
  if (operation === 'add') {
    this.currentStock += quantity;
  } else if (operation === 'subtract') {
    this.currentStock = Math.max(0, this.currentStock - quantity);
  } else if (operation === 'set') {
    this.currentStock = Math.max(0, quantity);
  }
  
  // Update alerts
  this.alerts.lowStock = this.currentStock <= this.minStockLevel;
  
  return this.save();
};

// Method to check if item needs reorder
inventorySchema.methods.needsReorder = function() {
  return this.currentStock <= this.minStockLevel;
};

// Pre-save middleware to update alerts
inventorySchema.pre('save', function(next) {
  // Update stock alerts
  this.alerts.lowStock = this.currentStock <= this.minStockLevel;
  
  // Update expiry alerts
  if (this.expiryDate) {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((this.expiryDate - now) / (1000 * 60 * 60 * 24));
    
    this.alerts.expired = daysUntilExpiry < 0;
    this.alerts.nearExpiry = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    
    if (this.alerts.expired) {
      this.status = 'expired';
    }
  }
  
  next();
});

export default mongoose.model('Inventory', inventorySchema);