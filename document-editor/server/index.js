// Load environment variables first, before any other code
require('dotenv').config();

// Make sure Firebase Admin is initialized next
require('./config/firebase');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
// ... other imports

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  credentials: true
}));

app.use(express.json());

// Routes
const documentsRouter = require('./routes/documents');
const storiesRouter = require('./routes/stories');
const charactersRouter = require('./routes/characters');

app.use('/api/documents', documentsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/characters', charactersRouter);

// Add a test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Log registered routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log('Route:', r.route.path)
  } else if(r.name === 'router'){
    console.log('Router:', r.regexp);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 