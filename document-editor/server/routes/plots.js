const express = require('express');
const router = express.Router();
const plotController = require('../controllers/plotController');
const { authenticateToken } = require('../middleware/auth');

// Add debug logging
router.use((req, res, next) => {
  console.log('Plots Route:', {
    method: req.method,
    path: req.path,
    params: req.params,
    body: req.body
  });
  next();
});

// Plot routes with individual auth middleware
router.get('/document/:documentId', authenticateToken, plotController.getPlot);
router.put('/document/:documentId', authenticateToken, plotController.updatePlot);
router.post('/document/:documentId/points', authenticateToken, plotController.addPlotPoint);
router.put('/document/:documentId/points/:pointId', authenticateToken, plotController.updatePlotPoint);
router.delete('/document/:documentId/points/:pointId', authenticateToken, plotController.deletePlotPoint);

module.exports = router; 