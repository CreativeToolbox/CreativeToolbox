const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateToken } = require('../middleware/auth');

// Add debug logging
router.use((req, res, next) => {
  console.log('Settings Route:', {
    method: req.method,
    path: req.path,
    params: req.params,
    body: req.body
  });
  next();
});

// Settings routes with individual auth middleware
router.get('/document/:documentId', authenticateToken, settingController.getSetting);
router.put('/document/:documentId', authenticateToken, settingController.updateSetting);

// Location routes
router.post('/document/:documentId/locations', authenticateToken, settingController.addLocation);
router.put('/document/:documentId/locations/:locationId', authenticateToken, settingController.updateLocation);
router.delete('/document/:documentId/locations/:locationId', authenticateToken, settingController.deleteLocation);

// Timeline routes
router.post('/document/:documentId/timeline', authenticateToken, settingController.addTimelinePeriod);
router.put('/document/:documentId/timeline/:periodId', authenticateToken, settingController.updateTimelinePeriod);
router.delete('/document/:documentId/timeline/:periodId', authenticateToken, settingController.deleteTimelinePeriod);

module.exports = router; 