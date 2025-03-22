const Document = require('../models/Document');
const Story = require('../models/Story');

exports.createDocument = async (req, res) => {
  try {
    const document = new Document({
      title: req.body.title || 'Untitled Story',
      content: req.body.content || '',
      userId: req.user.uid,
      visibility: req.body.visibility || 'private',
      theme: req.body.theme || {
        mainThemes: [],
        motifs: [],
        symbols: []
      }
    });

    const savedDocument = await document.save();
    
    await Story.createForDocument(savedDocument._id);
    
    res.status(201).json(savedDocument);
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
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.isOwner(req.user.uid)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await document.remove();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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