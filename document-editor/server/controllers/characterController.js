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
    const character = await Character.findById(req.params.id)
      .populate('relationships.character', 'name');
    
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
    // Validate the document exists and has character tracking enabled
    const document = await Document.findById(req.body.document);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (!document.enableCharacterTracking) {
      return res.status(400).json({ 
        message: 'Character tracking is not enabled for this document' 
      });
    }

    const { isValid, errors } = Character.validateCharacter(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const character = new Character(req.body);
    await character.save();
    res.status(201).json(character);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update a character
exports.updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const character = await Character.findById(id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Prevent changing the document association
    delete updates.document;

    Object.keys(updates).forEach(key => {
      character[key] = updates[key];
    });

    await character.save();
    res.json(character);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete a character
exports.deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    await character.remove();
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a relationship between characters
exports.addRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetCharacterId, relationshipType, description } = req.body;

    const character = await Character.findById(id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const targetCharacter = await Character.findById(targetCharacterId);
    if (!targetCharacter) {
      return res.status(404).json({ message: 'Target character not found' });
    }

    character.relationships.push({
      character: targetCharacterId,
      relationshipType,
      description
    });

    await character.save();
    res.json(character);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this new controller method
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