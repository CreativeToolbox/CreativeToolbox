const Document = require('../models/Document');
const Story = require('../models/Story');

exports.createDocument = async (req, res) => {
  try {
    const document = new Document(req.body);
    await document.save();

    // Create associated story
    await Story.createForDocument(document._id);

    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 