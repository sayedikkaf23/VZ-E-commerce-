const mongoose = require('mongoose');

const BusinessCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // isActive: {
  //   type: Boolean,
  //   default: true,
  // },
  risk: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  Score: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // replace 'User' with your actual user model name
    default: null,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update `updatedAt` on save
BusinessCategorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const BusinessCategory = mongoose.model('BusinessCategory', BusinessCategorySchema);

module.exports = BusinessCategory;
