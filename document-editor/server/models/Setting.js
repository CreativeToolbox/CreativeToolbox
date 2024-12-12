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
});

const timelineSchema = new mongoose.Schema({
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
});

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
  locations: [locationSchema],
  timeline: [timelineSchema],
  worldDetails: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add index for faster queries
settingSchema.index({ document: 1 });

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting; 