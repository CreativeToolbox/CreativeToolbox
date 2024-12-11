const mongoose = require('mongoose');
const VALID_MOOD_PRESETS = require('../constants/moodPresets');

const moodSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['preset', 'custom'],
    required: true
  },
  preset: {
    type: String,
    enum: VALID_MOOD_PRESETS
  },
  custom: {
    type: String,
    minlength: 2,
    maxlength: 50,
    match: /^[a-zA-Z0-9\s-]+$/
  },
  description: String
}, { _id: false });

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
    type: moodSchema,
    required: true,
    validate: {
      validator: function(mood) {
        if (mood.type === 'preset') {
          return mood.preset && VALID_MOOD_PRESETS.includes(mood.preset);
        } else if (mood.type === 'custom') {
          return mood.custom && 
                 mood.custom.length >= 2 && 
                 mood.custom.length <= 50 && 
                 /^[a-zA-Z0-9\s-]+$/.test(mood.custom);
        }
        return false;
      },
      message: props => {
        if (props.value.type === 'preset') {
          return 'Invalid preset mood value';
        }
        return 'Custom mood must be 2-50 characters long and contain only letters, numbers, spaces, and hyphens';
      }
    }
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