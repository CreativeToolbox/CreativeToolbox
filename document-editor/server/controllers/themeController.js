const Theme = require('../models/Theme');

exports.getTheme = async (req, res) => {
  try {
    const { documentId } = req.params;
    let theme = await Theme.findOne({ document: documentId });
    
    if (!theme) {
      // Create default theme if none exists
      theme = await Theme.create({
        document: documentId,
        mainThemes: [],
        motifs: [],
        symbols: []
      });
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

    const theme = await Theme.findOneAndUpdate(
      { document: documentId },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(theme);
  } catch (error) {
    console.error('Error in updateTheme:', error);
    res.status(500).json({ message: error.message });
  }
};

// Main themes management
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

// Motif management
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

// Symbol management
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