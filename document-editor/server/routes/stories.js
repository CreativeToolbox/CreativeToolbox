const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// Add logging to debug
router.get('/document/:documentId', (req, res, next) => {
  console.log('Accessing story route with documentId:', req.params.documentId);
  storyController.getStory(req, res, next);
});

router.put('/document/:documentId/mode', storyController.updateMode);

module.exports = router; 