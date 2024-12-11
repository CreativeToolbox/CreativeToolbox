const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Character name is required'],
    trim: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: [true, 'Character must be associated with a document']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  traits: [{
    type: String,
    trim: true
  }],
  relationships: [{
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character'
    },
    relationshipType: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  backstory: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  appearances: [{
    // Store text snippets or references where this character appears
    excerpt: {
      type: String,
      trim: true
    },
    position: {
      // Could be used to track where in the document this appearance occurs
      type: Number
    }
  }],
  metadata: {
    age: Number,
    gender: String,
    occupation: String,
    // Add any other relevant character metadata
  }
}, {
  timestamps: true
});

// Add indexes
characterSchema.index({ document: 1, name: 1 });

// Validation method
characterSchema.statics.validateCharacter = function(character) {
  const errors = [];

  if (!character.name) {
    errors.push('Character name is required');
  }

  if (!character.document) {
    errors.push('Character must be associated with a document');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Pre-save middleware to ensure name uniqueness within a document
characterSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingCharacter = await this.constructor.findOne({
      document: this.document,
      name: this.name,
      _id: { $ne: this._id }
    });

    if (existingCharacter) {
      throw new Error('A character with this name already exists in this document');
    }
  }
  next();
});

// Method to get all characters in a document
characterSchema.statics.getDocumentCharacters = async function(documentId) {
  return this.find({ document: documentId }).sort('name');
};

// Update Document model to include characters
const Document = require('./Document');
Document.schema.virtual('characters', {
  ref: 'Character',
  localField: '_id',
  foreignField: 'document'
});

// Create and export the model
const Character = mongoose.model('Character', characterSchema);
module.exports = Character; 