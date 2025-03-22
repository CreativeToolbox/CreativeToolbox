const express = require('express');
const router = express.Router();
const plotController = require('../controllers/plotController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Plot routes
router.get('/document/:documentId', plotController.getPlot);
router.put('/document/:documentId', plotController.updatePlot);
router.post('/document/:documentId/points', plotController.addPlotPoint);
router.put('/document/:documentId/points/:pointId', plotController.updatePlotPoint);
router.delete('/document/:documentId/points/:pointId', plotController.deletePlotPoint);

module.exports = router; 