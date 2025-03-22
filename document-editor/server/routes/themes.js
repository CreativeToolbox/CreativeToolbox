const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { authenticateToken } = require('../middleware/auth');

// Add debug logging
router.use((req, res, next) => {
  console.log('Themes Route:', {
    method: req.method,
    path: req.path,
    params: req.params,
    body: req.body
  });
  next();
});

// Theme routes with individual auth middleware
router.get('/document/:documentId', authenticateToken, themeController.getTheme);
router.put('/document/:documentId', authenticateToken, themeController.updateTheme);

// Main themes
router.post('/document/:documentId/main-themes', authenticateToken, themeController.addMainTheme);
router.put('/document/:documentId/main-themes/:themeId', authenticateToken, themeController.updateMainTheme);
router.delete('/document/:documentId/main-themes/:themeId', authenticateToken, themeController.deleteMainTheme);

// Motifs
router.post('/document/:documentId/motifs', authenticateToken, themeController.addMotif);
router.put('/document/:documentId/motifs/:motifId', authenticateToken, themeController.updateMotif);
router.delete('/document/:documentId/motifs/:motifId', authenticateToken, themeController.deleteMotif);

// Symbols
router.post('/document/:documentId/symbols', authenticateToken, themeController.addSymbol);
router.put('/document/:documentId/symbols/:symbolId', authenticateToken, themeController.updateSymbol);
router.delete('/document/:documentId/symbols/:symbolId', authenticateToken, themeController.deleteSymbol);

module.exports = router; 