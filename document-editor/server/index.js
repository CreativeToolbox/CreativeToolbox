// Make sure Firebase Admin is initialized first
require('./config/firebase');  // Add this at the top

const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
// ... other imports

const app = express();

// ... rest of your server setup 