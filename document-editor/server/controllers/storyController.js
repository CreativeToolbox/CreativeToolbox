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