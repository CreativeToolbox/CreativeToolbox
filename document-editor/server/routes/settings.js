const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Get and update main setting
router.get('/document/:documentId', settingController.getSetting);
router.put('/document/:documentId', settingController.updateSetting);

// Location management
router.post('/document/:documentId/locations', settingController.addLocation);
router.put('/document/:documentId/locations/:locationId', settingController.updateLocation);
router.delete('/document/:documentId/locations/:locationId', settingController.deleteLocation);

// Timeline management
router.post('/document/:documentId/timeline', settingController.addTimelinePeriod);
router.put('/document/:documentId/timeline/:periodId', settingController.updateTimelinePeriod);
router.delete('/document/:documentId/timeline/:periodId', settingController.deleteTimelinePeriod);

module.exports = router; 