const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const authMiddleware = require('../middleware/auth');

// Public routes - no authentication required
router.get('/', async (req, res) => {
  try {
    const { mode = 'public' } = req.query;
    const documents = await Document.findAccessible(req.user?.uid, mode)
      .sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.isAccessibleBy(req.user?.uid)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes - require authentication
router.use(authMiddleware);

router.post('/', async (req, res) => {
  console.log('User from auth:', req.user);
  console.log('Request body:', req.body);
  try {
    const validation = Document.validateDocument({
      ...req.body,
      userId: req.user.uid
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const document = new Document({
      ...req.body,
      userId: req.user.uid,
      visibility: req.body.visibility || 'private'
    });

    const newDocument = await document.save();
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.isOwner(req.user.uid)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const validation = Document.validateDocument({
      ...req.body,
      userId: req.user.uid
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    Object.assign(document, req.body);
    await document.save();
    
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.isOwner(req.user.uid)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;