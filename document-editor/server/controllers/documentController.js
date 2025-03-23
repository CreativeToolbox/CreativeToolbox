const Document = require('../models/Document');
const Story = require('../models/Story');

exports.createDocument = async (req, res) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'User must be authenticated' });
    }

    // Create a new empty document with default values
    const document = new Document({
      title: 'Untitled',
      content: '',
      userId: req.user.uid,
      visibility: 'private',
      theme: {
        mainThemes: [],
        motifs: [],
        symbols: []
      }
    });

    const savedDocument = await document.save();
    
    // Create associated story if needed
    if (Story) {
      try {
        await Story.createForDocument(savedDocument._id);
      } catch (error) {
        console.error('Error creating associated story:', error);
        // Continue even if story creation fails
      }
    }
    
    // Return the complete document object
    const populatedDocument = await Document.findById(savedDocument._id);
    console.log('Created new document:', populatedDocument);
    res.status(201).json(populatedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ 
      message: 'Error creating document', 
      error: error.message 
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { mode = 'public' } = req.query;
    const documents = await Document.findAccessible(req.user?.uid, mode)
      .sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid document ID' });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.isAccessibleBy(req.user?.uid)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateDocument = async (req, res) => {
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
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid; // From Firebase auth middleware

    // Find document and verify ownership
    const document = await Document.findOne({ _id: id, userId });
    
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found or you do not have permission to delete it' 
      });
    }

    // Delete the document
    await Document.findByIdAndDelete(id);
    
    res.json({ 
      message: 'Document deleted successfully',
      documentId: id
    });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    res.status(500).json({ 
      message: 'Failed to delete document',
      error: error.message 
    });
  }
};

exports.forkDocument = async (req, res) => {
  try {
    const originalDoc = await Document.findById(req.params.id);
    if (!originalDoc) {
      return res.status(404).json({ message: 'Original document not found' });
    }

    const document = new Document({
      title: `${originalDoc.title} (Fork)`,
      content: originalDoc.content,
      userId: req.body.userId,
      visibility: 'private',
      theme: originalDoc.theme || {
        mainThemes: [],
        motifs: [],
        symbols: []
      }
    });

    const savedDocument = await document.save();
    res.status(201).json(savedDocument);
  } catch (error) {
    console.error('Error forking document:', error);
    res.status(500).json({ message: 'Error forking document', error: error.message });
  }
};