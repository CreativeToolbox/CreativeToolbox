const mongoose = require('mongoose');

const mainThemeSchema = new mongoose.Schema({
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
  exploration: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const motifSchema = new mongoose.Schema({
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
  purpose: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const occurrenceSchema = new mongoose.Schema({
  context: {
    type: String,
    required: true,
    trim: true
  },
  significance: {
    type: String,
    default: '',
    trim: true
  }
});

const symbolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  meaning: {
    type: String,
    default: '',
    trim: true
  },
  occurrences: [occurrenceSchema]
}, { timestamps: true });

const themeSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  mainThemes: [mainThemeSchema],
  motifs: [motifSchema],
  symbols: [symbolSchema]
}, { timestamps: true });

// Add index for faster queries
themeSchema.index({ document: 1 });

const Theme = mongoose.model('Theme', themeSchema);
module.exports = Theme; 