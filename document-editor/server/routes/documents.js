const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');

// Document routes - apply auth middleware to specific routes that need it
router.get('/', authenticateToken, documentController.getDocuments);
router.get('/:id', authenticateToken, documentController.getDocument);
router.post('/', authenticateToken, documentController.createDocument);
router.put('/:id', authenticateToken, documentController.updateDocument);
router.delete('/:id', authenticateToken, documentController.deleteDocument);
router.post('/:id/fork', authenticateToken, documentController.forkDocument);

module.exports = router;