const Character = require('../models/Character');
const Document = require('../models/Document');

// Get all characters for a document
exports.getCharacters = async (req, res) => {
  try {
    const { documentId } = req.params;
    const characters = await Character.getDocumentCharacters(documentId);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single character
exports.getCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new character
exports.createCharacter = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.document) {
      return res.status(400).json({ 
        message: 'Name and document are required fields' 
      });
    }

    const character = new Character({
      name: req.body.name,
      role: req.body.role || 'supporting',
      description: req.body.description || '',
      goals: req.body.goals || '',
      conflicts: req.body.conflicts || '',
      document: req.body.document
    });

    await character.save();
    res.status(201).json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a character
exports.updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      name: req.body.name,
      role: req.body.role,
      description: req.body.description,
      goals: req.body.goals,
      conflicts: req.body.conflicts
    };

    const character = await Character.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json(character);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a character
exports.deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle character tracking
exports.toggleCharacterTracking = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { enabled } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.enableCharacterTracking = enabled;
    await document.save();

    res.json({ 
      message: `Character tracking ${enabled ? 'enabled' : 'disabled'}`,
      enableCharacterTracking: document.enableCharacterTracking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 