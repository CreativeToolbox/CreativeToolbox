const express = require('express');
const router = express.Router();
const { analyzeStory, analyzeScene } = require('../services/openaiService');
const { authenticateToken } = require('../middleware/auth');

// Analyze entire story
router.post('/analyze-story', authenticateToken, async (req, res) => {
  try {
    const { documentId, content, scenes } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Story content is required' });
    }

    const analysis = await analyzeStory(content, scenes || []);
    res.json(analysis);
  } catch (error) {
    console.error('Error in analyze-story route:', error);
    res.status(500).json({ error: 'Failed to analyze story' });
  }
});

// Analyze individual scene
router.post('/analyze-scene', authenticateToken, async (req, res) => {
  try {
    const { documentId, scene } = req.body;
    
    if (!scene) {
      return res.status(400).json({ error: 'Scene data is required' });
    }

    const analysis = await analyzeScene(scene);
    res.json(analysis);
  } catch (error) {
    console.error('Error in analyze-scene route:', error);
    res.status(500).json({ error: 'Failed to analyze scene' });
  }
});

module.exports = router; 