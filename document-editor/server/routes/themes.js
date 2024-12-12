const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

// Get and update main theme document
router.get('/document/:documentId', themeController.getTheme);
router.put('/document/:documentId', themeController.updateTheme);

// Main themes management
router.post('/document/:documentId/main-themes', themeController.addMainTheme);
router.put('/document/:documentId/main-themes/:themeId', themeController.updateMainTheme);
router.delete('/document/:documentId/main-themes/:themeId', themeController.deleteMainTheme);

// Motifs management
router.post('/document/:documentId/motifs', themeController.addMotif);
router.put('/document/:documentId/motifs/:motifId', themeController.updateMotif);
router.delete('/document/:documentId/motifs/:motifId', themeController.deleteMotif);

// Symbols management
router.post('/document/:documentId/symbols', themeController.addSymbol);
router.put('/document/:documentId/symbols/:symbolId', themeController.updateSymbol);
router.delete('/document/:documentId/symbols/:symbolId', themeController.deleteSymbol);

module.exports = router; 