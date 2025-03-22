const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticateToken } = require('../middleware/auth');

// Add debug logging
router.use((req, res, next) => {
  console.log('Stories Route:', {
    method: req.method,
    path: req.path,
    params: req.params,
    body: req.body
  });
  next();
});

// Story routes - apply auth middleware to specific routes
router.get('/document/:documentId', authenticateToken, storyController.getStory);
router.put('/document/:documentId/mode', authenticateToken, storyController.updateMode);
router.put('/document/:documentId/mood', authenticateToken, storyController.updateMood);

module.exports = router; 