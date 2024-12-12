const Plot = require('../models/Plot');

exports.getPlot = async (req, res) => {
  try {
    const { documentId } = req.params;
    let plot = await Plot.findOne({ document: documentId })
      .populate('mainConflictCharacters')
      .populate('plotPoints.involvedCharacters');

    if (!plot) {
      plot = await Plot.create({
        document: documentId,
        structure: 'three_act',
        plotPoints: []
      });
    }
    
    res.json(plot);
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