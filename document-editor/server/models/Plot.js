const mongoose = require('mongoose');

const plotPointSchema = new mongoose.Schema({
  title: {
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
    enum: [
      'exposition',
      'rising_action',
      'climax',
      'falling_action',
      'resolution',
      'setup',
      'conflict',
      'twist',
      'revelation'
    ],
    default: 'setup'
  },
  involvedCharacters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const plotSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  structure: {
    type: String,
    enum: ['three_act', 'five_act', 'hero_journey', 'custom'],
    default: 'three_act'
  },
  plotPoints: [plotPointSchema],
  mainConflict: {
    type: String,
    default: ''
  },
  mainConflictCharacters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  synopsis: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Add index for faster queries
plotSchema.index({ document: 1 });

const Plot = mongoose.model('Plot', plotSchema);
module.exports = Plot; 