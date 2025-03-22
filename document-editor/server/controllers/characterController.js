const Character = require('../models/Character');
const Document = require('../models/Document');

// Get all characters for a document
exports.getCharacters = async (req, res) => {
  try {
    const characters = await Character.find({ document: req.params.documentId });
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
    const character = new Character(req.body);
    const newCharacter = await character.save();
    res.status(201).json(newCharacter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a character
exports.updateCharacter = async (req, res) => {
  try {
    const character = await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(character);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a character
exports.deleteCharacter = async (req, res) => {
  try {
    await Character.findByIdAndDelete(req.params.id);
    res.json({ message: 'Character deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle character tracking
exports.toggleCharacterTracking = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { enabled } = req.body;
    
    // Update document's character tracking setting
    const document = await Document.findByIdAndUpdate(
      documentId,
      { enableCharacterTracking: enabled },
      { new: true }
    );
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 