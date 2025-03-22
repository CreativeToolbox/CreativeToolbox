const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['city', 'building', 'country', 'region', 'room', 'landscape', 'other'],
    default: 'other'
  },
  importance: {
    type: String,
    enum: ['primary', 'secondary', 'minor'],
    default: 'secondary'
  }
}, { timestamps: true });

const timelinePeriodSchema = new mongoose.Schema({
  period: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const settingSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  mainLocation: {
    type: String,
    default: ''
  },
  timePeriod: {
    type: String,
    default: ''
  },
  worldDetails: {
    type: String,
    default: ''
  },
  locations: [locationSchema],
  timeline: [timelinePeriodSchema]
}, { timestamps: true });

// Add index for faster queries
settingSchema.index({ document: 1 });

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting; 