const Theme = require('../models/Theme');
const mongoose = require('mongoose');

exports.getTheme = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    console.log('Getting theme for document:', documentId);

    const objectId = mongoose.Types.ObjectId.isValid(documentId) 
      ? new mongoose.Types.ObjectId(documentId)
      : documentId;

    let theme = await Theme.findOne({ document: objectId });
    console.log('Found theme:', theme);
    
    // If no theme exists, create a default one
    if (!theme) {
      console.log('No theme found, creating default');
      theme = await Theme.create({
        document: objectId,
        mainThemes: [],
        motifs: [],
        symbols: []
      });
      console.log('Created default theme:', theme);
    }

    res.json(theme);
  } catch (error) {
    console.error('Error in getTheme:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const { documentId } = req.params;
    const updates = req.body;
    console.log('Updating theme for document:', documentId);
    console.log('Received updates:', updates);

    // First, find the existing theme or create a default one
    let theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      theme = new Theme({
        document: documentId,
        mainThemes: [],
        motifs: [],
        symbols: []
      });
    }

    // Update only the fields that are present in the updates object
    if (updates.mainThemes !== undefined) theme.mainThemes = updates.mainThemes;
    if (updates.motifs !== undefined) theme.motifs = updates.motifs;
    if (updates.symbols !== undefined) theme.symbols = updates.symbols;

    // Save the updated document
    await theme.save();
    console.log('Saved theme:', theme);

    res.json(theme);
  } catch (error) {
    console.error('Error in updateTheme:', error);
    res.status(500).json({ message: error.message });
  }
};

// Main themes handlers
exports.addMainTheme = async (req, res) => {
  try {
    const { documentId } = req.params;
    const themeData = req.body;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    theme.mainThemes.push(themeData);
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in addMainTheme:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateMainTheme = async (req, res) => {
  try {
    const { documentId, themeId } = req.params;
    const updates = req.body;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const mainTheme = theme.mainThemes.id(themeId);
    if (!mainTheme) {
      return res.status(404).json({ message: 'Main theme not found' });
    }

    Object.assign(mainTheme, updates);
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in updateMainTheme:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMainTheme = async (req, res) => {
  try {
    const { documentId, themeId } = req.params;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    theme.mainThemes = theme.mainThemes.filter(
      t => t._id.toString() !== themeId
    );
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in deleteMainTheme:', error);
    res.status(500).json({ message: error.message });
  }
};

// Motif handlers
exports.addMotif = async (req, res) => {
  try {
    const { documentId } = req.params;
    const motifData = req.body;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    theme.motifs.push(motifData);
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in addMotif:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateMotif = async (req, res) => {
  try {
    const { documentId, motifId } = req.params;
    const updates = req.body;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const motif = theme.motifs.id(motifId);
    if (!motif) {
      return res.status(404).json({ message: 'Motif not found' });
    }

    Object.assign(motif, updates);
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in updateMotif:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMotif = async (req, res) => {
  try {
    const { documentId, motifId } = req.params;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    theme.motifs = theme.motifs.filter(
      m => m._id.toString() !== motifId
    );
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in deleteMotif:', error);
    res.status(500).json({ message: error.message });
  }
};

// Symbol handlers
exports.addSymbol = async (req, res) => {
  try {
    const { documentId } = req.params;
    const symbolData = req.body;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    theme.symbols.push(symbolData);
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in addSymbol:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateSymbol = async (req, res) => {
  try {
    const { documentId, symbolId } = req.params;
    const updates = req.body;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const symbol = theme.symbols.id(symbolId);
    if (!symbol) {
      return res.status(404).json({ message: 'Symbol not found' });
    }

    Object.assign(symbol, updates);
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in updateSymbol:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSymbol = async (req, res) => {
  try {
    const { documentId, symbolId } = req.params;

    const theme = await Theme.findOne({ document: documentId });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    theme.symbols = theme.symbols.filter(
      s => s._id.toString() !== symbolId
    );
    await theme.save();

    res.json(theme);
  } catch (error) {
    console.error('Error in deleteSymbol:', error);
    res.status(500).json({ message: error.message });
  }
}; 