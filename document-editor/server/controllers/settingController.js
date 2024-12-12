const Setting = require('../models/Setting');

exports.getSetting = async (req, res) => {
  try {
    const { documentId } = req.params;
    let setting = await Setting.findOne({ document: documentId });
    
    if (!setting) {
      // Create default setting if none exists
      setting = await Setting.create({
        document: documentId,
        locations: [],
        timeline: []
      });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Error in getSetting:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { documentId } = req.params;
    const updates = req.body;

    const setting = await Setting.findOneAndUpdate(
      { document: documentId },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(setting);
  } catch (error) {
    console.error('Error in updateSetting:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addLocation = async (req, res) => {
  try {
    const { documentId } = req.params;
    const locationData = req.body;

    const setting = await Setting.findOne({ document: documentId });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    setting.locations.push(locationData);
    await setting.save();

    res.json(setting);
  } catch (error) {
    console.error('Error in addLocation:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { documentId, locationId } = req.params;
    const updates = req.body;

    const setting = await Setting.findOne({ document: documentId });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    const location = setting.locations.id(locationId);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    Object.assign(location, updates);
    await setting.save();

    res.json(setting);
  } catch (error) {
    console.error('Error in updateLocation:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { documentId, locationId } = req.params;

    const setting = await Setting.findOne({ document: documentId });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    setting.locations = setting.locations.filter(
      loc => loc._id.toString() !== locationId
    );
    await setting.save();

    res.json(setting);
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Timeline management
exports.addTimelinePeriod = async (req, res) => {
  try {
    const { documentId } = req.params;
    const periodData = req.body;

    const setting = await Setting.findOne({ document: documentId });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    setting.timeline.push(periodData);
    await setting.save();

    res.json(setting);
  } catch (error) {
    console.error('Error in addTimelinePeriod:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTimelinePeriod = async (req, res) => {
  try {
    const { documentId, periodId } = req.params;
    const updates = req.body;

    const setting = await Setting.findOne({ document: documentId });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    const period = setting.timeline.id(periodId);
    if (!period) {
      return res.status(404).json({ message: 'Timeline period not found' });
    }

    Object.assign(period, updates);
    await setting.save();

    res.json(setting);
  } catch (error) {
    console.error('Error in updateTimelinePeriod:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTimelinePeriod = async (req, res) => {
  try {
    const { documentId, periodId } = req.params;

    const setting = await Setting.findOne({ document: documentId });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    setting.timeline = setting.timeline.filter(
      period => period._id.toString() !== periodId
    );
    await setting.save();

    res.json(setting);
  } catch (error) {
    console.error('Error in deleteTimelinePeriod:', error);
    res.status(500).json({ message: error.message });
  }
}; 