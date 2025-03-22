const Document = require('../models/Document');

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

    res.json({
      _id: document._id,
      title: document.title || '',
      content: document.content || '',
      userId: document.userId,
      visibility: document.visibility,
      enableCharacterTracking: document.enableCharacterTracking || false,
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createDocument = async (req, res) => {
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
};

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    console.log('Update request:', {
      documentId: id,
      userId,
      updates: req.body
    });

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.isOwner(userId)) {
      console.log('Authorization failed:', {
        documentOwner: document.owner,
        requestUser: userId
      });
      return res.status(403).json({ message: 'Not authorized to edit this document' });
    }

    Object.assign(document, req.body);
    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: error.message });
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

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 