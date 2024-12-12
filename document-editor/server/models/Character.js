const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: [
      'protagonist',
      'antagonist',
      'supporting',
      'mentor',
      'sidekick',
      'love_interest'
    ],
    default: 'supporting'
  },
  description: {
    type: String,
    default: ''
  },
  goals: {
    type: String,
    default: ''
  },
  conflicts: {
    type: String,
    default: ''
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  }
}, {
  timestamps: true
});

// Add index for faster queries
characterSchema.index({ document: 1 });

// Add method to get all characters for a document
characterSchema.statics.getDocumentCharacters = function(documentId) {
  return this.find({ document: documentId }).sort('name');
};

const Character = mongoose.model('Character', characterSchema);

module.exports = Character; 