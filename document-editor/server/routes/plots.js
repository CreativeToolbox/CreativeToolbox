const express = require('express');
const router = express.Router();
const plotController = require('../controllers/plotController');

// Get plot for a document
router.get('/document/:documentId', plotController.getPlot);

// Update plot
router.put('/document/:documentId', plotController.updatePlot);

// Plot points
router.post('/document/:documentId/points', plotController.addPlotPoint);
router.put('/document/:documentId/points/:pointId', plotController.updatePlotPoint);
router.delete('/document/:documentId/points/:pointId', plotController.deletePlotPoint);

module.exports = router; 