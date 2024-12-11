const mongoose = require('mongoose');

// Define valid presets as a constant
const VALID_MOOD_PRESETS = [
  'joyful', 'melancholic', 'tense', 'peaceful', 'mysterious',
  'romantic', 'adventurous', 'dark', 'humorous', 'nostalgic'
];

const storySchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  mode: {
    narrative: {
      type: Number,
      default: 50
    },
    dialogue: {
      type: Number,
      default: 50
    }
  },
  mood: {
    type: { 
      type: String, 
      enum: ['preset', 'custom'],
      required: true
    },
    preset: {
      type: String,
      enum: VALID_MOOD_PRESETS,
      required: function() { return this.mood.type === 'preset'; }
    },
    custom: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.mood.type === 'custom') {
            return v && v.length >= 2 && v.length <= 50 && /^[a-zA-Z0-9\s-]+$/.test(v);
          }
          return true;
        },
        message: 'Custom mood must be 2-50 characters long and contain only letters, numbers, spaces, and hyphens'
      }
    },
    description: String
  }
}, {
  timestamps: true
});

// Add logging to debug
storySchema.statics.createForDocument = async function(documentId) {
  console.log('Creating story for document:', documentId);
  return this.create({
    document: documentId,
    mode: { narrative: 50, dialogue: 50 }
  });
};

storySchema.statics.ensureStoryExists = async function(documentId) {
  console.log('Ensuring story exists for document:', documentId);
  const existingStory = await this.findOne({ document: documentId });
  if (!existingStory) {
    return await this.createForDocument(documentId);
  }
  return existingStory;
};

const Story = mongoose.model('Story', storySchema);
module.exports = Story; 