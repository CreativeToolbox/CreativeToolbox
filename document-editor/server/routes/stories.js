const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const authMiddleware = require('../middleware/auth');

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

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get story for a document
router.get('/document/:documentId', storyController.getStory);

// Update story mode and mood
router.put('/document/:documentId/mode', storyController.updateMode);
router.put('/document/:documentId/mood', storyController.updateMood);

module.exports = router; 