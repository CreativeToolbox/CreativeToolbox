const mongoose = require('mongoose');

// Define the schema
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add static methods
documentSchema.statics.validateDocument = function(doc) {
  const errors = [];

  if (!doc.title) {
    errors.push('Title is required');
  } else if (typeof doc.title !== 'string') {
    errors.push('Title must be a string');
  }

  if (typeof doc.content !== 'string') {
    errors.push('Content must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create and export the model
const Document = mongoose.model('Document', documentSchema);
module.exports = Document;