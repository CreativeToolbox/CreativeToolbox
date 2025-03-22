const admin = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth check for:', req.method, req.path);
    console.log('Auth headers:', {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer [token]' : undefined
    });
    
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      console.log('Verifying token:', token.substring(0, 20) + '...');
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Token verified for user:', decodedToken.uid);
      req.user = decodedToken;
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authMiddleware;