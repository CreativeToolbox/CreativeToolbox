const Story = require('../models/Story');

exports.getStory = async (req, res) => {
  try {
    const story = await Story.ensureStoryExists(req.params.documentId);
    res.json(story);
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
    const { type, preset, custom, description } = req.body;

    // Validate input
    if (!type || !['preset', 'custom'].includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid mood type. Must be either "preset" or "custom".' 
      });
    }

    if (type === 'preset' && !VALID_MOOD_PRESETS.includes(preset)) {
      return res.status(400).json({ 
        message: 'Invalid preset mood value.' 
      });
    }

    if (type === 'custom') {
      if (!custom || custom.length < 2 || custom.length > 50) {
        return res.status(400).json({ 
          message: 'Custom mood must be between 2 and 50 characters.' 
        });
      }
      
      if (!/^[a-zA-Z0-9\s-]+$/.test(custom)) {
        return res.status(400).json({ 
          message: 'Custom mood can only contain letters, numbers, spaces, and hyphens.' 
        });
      }
    }

    const story = await Story.findOneAndUpdate(
      { document: req.params.documentId },
      { 
        $set: { 
          'mood.type': type,
          'mood.preset': type === 'preset' ? preset : undefined,
          'mood.custom': type === 'custom' ? custom : undefined,
          'mood.description': description
        }
      },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json(story);
  } catch (error) {
    console.error('Error in updateMood:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: error.message });
  }
}; 