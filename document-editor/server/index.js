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

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  credentials: true
}));

app.use(express.json());

// Load all routers
console.log('\nLoading Routers...');
const documentsRouter = require('./routes/documents');
const storiesRouter = require('./routes/stories');
const charactersRouter = require('./routes/characters');
const plotsRouter = require('./routes/plots');
const settingsRouter = require('./routes/settings');
const themesRouter = require('./routes/themes');

// Mount routes
console.log('\nMounting Routes...');
app.use('/api/documents', documentsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/plots', plotsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/themes', themesRouter);

// Add a test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug endpoint to show all routes
app.get('/api/routes', (req, res) => {
  const routes = {
    documents: documentsRouter.stack.map(r => r.route?.path).filter(Boolean),
    characters: charactersRouter.stack.map(r => r.route?.path).filter(Boolean),
    stories: storiesRouter.stack.map(r => r.route?.path).filter(Boolean),
    plots: plotsRouter.stack.map(r => r.route?.path).filter(Boolean),
    settings: settingsRouter.stack.map(r => r.route?.path).filter(Boolean),
    themes: themesRouter.stack.map(r => r.route?.path).filter(Boolean)
  };
  res.json(routes);
});

// Log registered routes
console.log('\nRegistered Routes:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log('Route:', r.route.path);
  } else if(r.name === 'router'){
    console.log('Router:', r.regexp);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 