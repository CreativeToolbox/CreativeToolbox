const mongoose = require('mongoose');
const Story = require('../models/Story');

const VALID_MOOD_PRESETS = Object.freeze([
    'happy',
    'sad',
    'angry',
    'peaceful',
    'tense',
    'mysterious',
    'romantic',
    'adventurous'
]);

exports.VALID_MOOD_PRESETS = VALID_MOOD_PRESETS;

exports.getStory = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    console.log('Getting story for document:', documentId);

    // Convert string ID to ObjectId if needed
    const objectId = mongoose.Types.ObjectId.isValid(documentId) 
      ? new mongoose.Types.ObjectId(documentId)
      : documentId;

    let story = await Story.findOne({ document: objectId });
    
    // If no story exists, create a default one
    if (!story) {
      story = await Story.create({
        document: objectId,
        mode: { narrative: 50, dialogue: 50 },
        mood: 'peaceful'
      });
    }

    // Ensure we're sending a properly formatted response
    const response = {
      _id: story._id,
      document: story.document,
      mode: story.mode || { narrative: 50, dialogue: 50 },
      mood: story.mood || 'peaceful',
      createdAt: story.createdAt,
      updatedAt: story.updatedAt
    };
    
    console.log('Returning story:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in getStory:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateMode = async (req, res) => {
  try {
    const { narrative, dialogue } = req.body;
    const story = await Story.findOneAndUpdate(
      { document: req.params.documentId },
      { 
        $set: { 
          'mode.narrative': narrative,
          'mode.dialogue': dialogue
        }
      },
      { new: true, upsert: true }
    );
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMood = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const { mood } = req.body;

    console.log('Received mood update:', { documentId, mood });

    if (!mood || !VALID_MOOD_PRESETS.includes(mood)) {
      return res.status(400).json({ 
        error: `Invalid mood preset. Must be one of: ${VALID_MOOD_PRESETS.join(', ')}`,
        receivedMood: mood
      });
    }

    const updatedStory = await Story.findOneAndUpdate(
      { document: documentId },
      { mood },
      { new: true, upsert: true }
    );

    console.log('Updated story:', updatedStory);
    res.json(updatedStory);
  } catch (error) {
    console.error('Error in updateMood:', error);
    res.status(500).json({ 
      error: 'Failed to update mood' 
    });
  }
}; 