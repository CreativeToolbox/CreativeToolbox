const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documentsController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Document routes
router.get('/', documentsController.getDocuments);
router.get('/:id', documentsController.getDocument);
router.post('/', documentsController.createDocument);
router.put('/:id', documentsController.updateDocument);
router.delete('/:id', documentsController.deleteDocument);

module.exports = router;