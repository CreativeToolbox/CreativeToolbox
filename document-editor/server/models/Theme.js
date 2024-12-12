const mongoose = require('mongoose');

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
  occurrences: [{
    context: String,
    significance: String
  }]
});

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
    default: '',
    trim: true
  }
});

const themeSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  mainThemes: [{
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
      default: '',
      trim: true
    }
  }],
  motifs: [motifSchema],
  symbols: [symbolSchema]
}, {
  timestamps: true
});

// Add index for faster queries
themeSchema.index({ document: 1 });

const Theme = mongoose.model('Theme', themeSchema);
module.exports = Theme; 