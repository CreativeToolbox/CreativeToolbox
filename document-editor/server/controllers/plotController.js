const Plot = require('../models/Plot');
const mongoose = require('mongoose');

exports.getPlot = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    console.log('Getting plot for document:', documentId);

    // Convert string ID to ObjectId if needed
    const objectId = mongoose.Types.ObjectId.isValid(documentId) 
      ? new mongoose.Types.ObjectId(documentId)
      : documentId;

    let plot = await Plot.findOne({ document: objectId })
      .populate('mainConflictCharacters')
      .populate('plotPoints.involvedCharacters');
    
    // If no plot exists, create a default one
    if (!plot) {
      plot = await Plot.create({
        document: objectId,
        structure: 'three_act',
        mainConflict: '',
        synopsis: '',
        plotPoints: [],
        mainConflictCharacters: []
      });
    }

    // Ensure we're sending a properly formatted response
    const response = {
      _id: plot._id,
      document: plot.document,
      structure: plot.structure || 'three_act',
      mainConflict: plot.mainConflict || '',
      synopsis: plot.synopsis || '',
      plotPoints: plot.plotPoints || [],
      mainConflictCharacters: plot.mainConflictCharacters || [],
      createdAt: plot.createdAt,
      updatedAt: plot.updatedAt
    };
    
    console.log('Returning plot:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in getPlot:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlot = async (req, res) => {
  try {
    const { documentId } = req.params;
    const updates = req.body;

    const plot = await Plot.findOneAndUpdate(
      { document: documentId },
      updates,
      { new: true, upsert: true, runValidators: true }
    ).populate('mainConflictCharacters')
     .populate('plotPoints.involvedCharacters');

    res.json(plot);
  } catch (error) {
    console.error('Error in updatePlot:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addPlotPoint = async (req, res) => {
  try {
    const { documentId } = req.params;
    const plotPoint = req.body;

    const plot = await Plot.findOne({ document: documentId });
    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    plot.plotPoints.push(plotPoint);
    await plot.save();

    await plot.populate('plotPoints.involvedCharacters');

    res.json(plot);
  } catch (error) {
    console.error('Error in addPlotPoint:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlotPoint = async (req, res) => {
  try {
    const { documentId, pointId } = req.params;
    const updates = req.body;

    const plot = await Plot.findOne({ document: documentId });
    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    const plotPoint = plot.plotPoints.id(pointId);
    if (!plotPoint) {
      return res.status(404).json({ message: 'Plot point not found' });
    }

    if (updates.involvedCharacters) {
      plotPoint.involvedCharacters = updates.involvedCharacters;
    }

    Object.assign(plotPoint, updates);
    await plot.save();

    await plot.populate('plotPoints.involvedCharacters');

    res.json(plot);
  } catch (error) {
    console.error('Error in updatePlotPoint:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePlotPoint = async (req, res) => {
  try {
    const { documentId, pointId } = req.params;

    const plot = await Plot.findOne({ document: documentId });
    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    plot.plotPoints = plot.plotPoints.filter(point => point._id.toString() !== pointId);
    await plot.save();

    res.json(plot);
  } catch (error) {
    console.error('Error in deletePlotPoint:', error);
    res.status(500).json({ message: error.message });
  }
}; 