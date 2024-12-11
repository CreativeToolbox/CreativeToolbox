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
  },
  // Add a flag to enable/disable character tracking
  enableCharacterTracking: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Enable virtuals when converting to JSON
  toObject: { virtuals: true }
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

// Add virtual for characters (this creates the relationship without storing it in the document)
documentSchema.virtual('characters', {
  ref: 'Character',
  localField: '_id',
  foreignField: 'document'
});

// Add method to get all characters
documentSchema.methods.getCharacters = async function() {
  await this.populate('characters');
  return this.characters;
};

// Create and export the model
const Document = mongoose.model('Document', documentSchema);
module.exports = Document;