const express = require('express');
const Document = require('../models/document');

const router = express.Router();

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use findByIdAndDelete instead of remove
    const deletedDoc = await Document.findByIdAndDelete(id);
    
    if (!deletedDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document deleted successfully', document: deletedDoc });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 