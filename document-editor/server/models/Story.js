const mongoose = require('mongoose');

const VALID_MOOD_PRESETS = [
  'happy',
  'sad',
  'angry',
  'peaceful',
  'tense',
  'mysterious',
  'romantic',
  'adventurous'
];

const storySchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  mood: {
    type: String,
    enum: VALID_MOOD_PRESETS,
    default: 'peaceful'
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
  }
}, {
  timestamps: true
});

// Add logging to debug
storySchema.statics.createForDocument = async function(documentId) {
  console.log('Creating story for document:', documentId);
  return this.create({
    document: documentId,
    mode: { narrative: 50, dialogue: 50 },
    mood: 'peaceful'
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