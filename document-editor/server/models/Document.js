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
  // Add user ownership
  userId: {
    type: String,
    required: true
  },
  // Add visibility control
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
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

  if (!doc.userId) {
    errors.push('User ID is required');
  }

  if (doc.visibility && !['public', 'private'].includes(doc.visibility)) {
    errors.push('Visibility must be either public or private');
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

// Add method to check if user is owner
documentSchema.methods.isOwner = function(userId) {
  return this.userId === userId;
};

// Add method to check if document is accessible to user
documentSchema.methods.isAccessibleBy = function(userId) {
  return this.visibility === 'public' || this.userId === userId;
};

// Add static method to find accessible documents
documentSchema.statics.findAccessible = function(userId, mode = 'public') {
  if (mode === 'private') {
    return this.find({ userId });
  }
  return this.find({ 
    $or: [
      { visibility: 'public' },
      { userId }
    ]
  });
};

// Create and export the model
const Document = mongoose.model('Document', documentSchema);
module.exports = Document;