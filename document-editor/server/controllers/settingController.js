const Setting = require('../models/Setting');
const mongoose = require('mongoose');

exports.getSetting = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    console.log('Getting setting for document:', documentId);

    const objectId = mongoose.Types.ObjectId.isValid(documentId) 
      ? new mongoose.Types.ObjectId(documentId)
      : documentId;

    let setting = await Setting.findOne({ document: objectId });
    console.log('Found setting:', setting);
    
    // If no setting exists, create a default one
    if (!setting) {
      console.log('No setting found, creating default');
      setting = await Setting.create({
        document: objectId,
        mainLocation: '',
        timePeriod: '',
        worldDetails: '',
        locations: [],
        timeline: []
      });
      console.log('Created default setting:', setting);
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
    console.log('Updating setting for document:', documentId);
    console.log('Received updates:', updates);

    // First, find the existing setting or create a default one
    let setting = await Setting.findOne({ document: documentId });
    if (!setting) {
      setting = new Setting({
        document: documentId,
        mainLocation: '',
        timePeriod: '',
        worldDetails: '',
        locations: [],
        timeline: []
      });
    }

    // Update only the fields that are present in the updates object
    if (updates.mainLocation !== undefined) setting.mainLocation = updates.mainLocation;
    if (updates.timePeriod !== undefined) setting.timePeriod = updates.timePeriod;
    if (updates.worldDetails !== undefined) setting.worldDetails = updates.worldDetails;
    if (updates.locations !== undefined) setting.locations = updates.locations;
    if (updates.timeline !== undefined) setting.timeline = updates.timeline;

    // Save the updated document
    await setting.save();
    console.log('Saved setting:', setting);

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

// Timeline period handlers
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