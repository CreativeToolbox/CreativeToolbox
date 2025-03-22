const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const { authenticateToken } = require('../middleware/auth');

// Add debug logging
router.use((req, res, next) => {
  console.log('Characters Route:', {
    method: req.method,
    path: req.path,
    params: req.params,
    body: req.body
  });
  next();
});

// Character routes with individual auth middleware
router.get('/document/:documentId', authenticateToken, characterController.getCharacters);
router.get('/:id', authenticateToken, characterController.getCharacter);
router.post('/', authenticateToken, characterController.createCharacter);
router.put('/:id', authenticateToken, characterController.updateCharacter);
router.delete('/:id', authenticateToken, characterController.deleteCharacter);

// Toggle character tracking
router.post('/document/:documentId/tracking', authenticateToken, characterController.toggleCharacterTracking);

module.exports = router; 