const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');

// Get all characters for a document
router.get('/document/:documentId', characterController.getCharacters);

// Get a single character
router.get('/:id', characterController.getCharacter);

// Create a new character
router.post('/', characterController.createCharacter);

// Update a character
router.put('/:id', characterController.updateCharacter);

// Delete a character
router.delete('/:id', characterController.deleteCharacter);

// Add a relationship between characters
router.post('/:id/relationships', characterController.addRelationship);

module.exports = router; 