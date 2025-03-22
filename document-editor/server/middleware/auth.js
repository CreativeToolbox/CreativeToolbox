const admin = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Verifying token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Token verified successfully');
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    console.error('Request headers:', req.headers);
    return res.status(401).json({ 
      message: 'Invalid token',
      error: error.message 
    });
  }
};

module.exports = authMiddleware;