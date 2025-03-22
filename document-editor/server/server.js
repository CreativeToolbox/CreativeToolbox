require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Add at the very top, after the requires
console.log('\n=== Starting Server ===');
console.log('Current directory:', process.cwd());
console.log('Looking for routes in:', require('path').resolve('./routes'));

// Initialize express app
const app = express();

// Load all routers with error handling
console.log('\nLoading Routers...');
let documentsRouter, charactersRouter, storiesRouter, plotsRouter, settingsRouter, themesRouter;

try {
  documentsRouter = require('./routes/documents');
  console.log('✅ Documents router loaded');
} catch (error) {
  console.error('❌ Error loading documents router:', error.message);
}

try {
  charactersRouter = require('./routes/characters');
  console.log('✅ Characters router loaded');
} catch (error) {
  console.error('❌ Error loading characters router:', error.message);
}

try {
  storiesRouter = require('./routes/stories');
  console.log('✅ Stories router loaded');
} catch (error) {
  console.error('❌ Error loading stories router:', error.message);
}

try {
  plotsRouter = require('./routes/plots');
  console.log('✅ Plots router loaded');
} catch (error) {
  console.error('❌ Error loading plots router:', error.message);
  console.error('Error details:', error);
}

try {
  settingsRouter = require('./routes/settings');
  console.log('✅ Settings router loaded');
} catch (error) {
  console.error('❌ Error loading settings router:', error.message);
  console.error('Error details:', error);
}

try {
  themesRouter = require('./routes/themes');
  console.log('✅ Themes router loaded');
} catch (error) {
  console.error('❌ Error loading themes router:', error.message);
  console.error('Error details:', error);
}

// Connect to MongoDB
connectDB();

// Middleware setup...
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  }));
}

app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Trust proxy - needed for rate limiting behind reverse proxies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Mount routers
console.log('\nMounting Routers...');
if (documentsRouter) {
  app.use('/api/documents', documentsRouter);
  console.log('✅ Documents routes mounted at /api/documents');
}
if (charactersRouter) {
  app.use('/api/characters', charactersRouter);
  console.log('✅ Characters routes mounted at /api/characters');
}
if (storiesRouter) {
  app.use('/api/stories', storiesRouter);
  console.log('✅ Stories routes mounted at /api/stories');
}
if (plotsRouter) {
  app.use('/api/plots', plotsRouter);
  console.log('✅ Plot routes mounted at /api/plots');
}
if (settingsRouter) {
  app.use('/api/settings', settingsRouter);
  console.log('✅ Settings routes mounted at /api/settings');
}
if (themesRouter) {
  app.use('/api/themes', themesRouter);
  console.log('✅ Theme routes mounted at /api/themes');
}

// Debug routes endpoint
app.get('/api/routes', (req, res) => {
  const routes = {
    documents: documentsRouter?.stack.map(r => r.route?.path).filter(Boolean),
    characters: charactersRouter?.stack.map(r => r.route?.path).filter(Boolean),
    stories: storiesRouter?.stack.map(r => r.route?.path).filter(Boolean),
    plots: plotsRouter?.stack.map(r => r.route?.path).filter(Boolean),
    settings: settingsRouter?.stack.map(r => r.route?.path).filter(Boolean),
    themes: themesRouter?.stack.map(r => r.route?.path).filter(Boolean)
  };
  res.json(routes);
});

// Add this right after mounting all routes, before the health check
console.log('\nRegistered Routes:');
console.log('Documents:', documentsRouter?.stack.map(r => r.route?.path).filter(Boolean));
console.log('Characters:', charactersRouter?.stack.map(r => r.route?.path).filter(Boolean));
console.log('Stories:', storiesRouter?.stack.map(r => r.route?.path).filter(Boolean));
console.log('Plots:', plotsRouter?.stack.map(r => r.route?.path).filter(Boolean));
console.log('Settings:', settingsRouter?.stack.map(r => r.route?.path).filter(Boolean));
console.log('Themes:', themesRouter?.stack.map(r => r.route?.path).filter(Boolean));

// Basic route for API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add this before the 404 handler
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // MongoDB casting error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`MongoDB URI: ${process.env.MONGODB_URI?.split('@')[1] || 'local database'}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

// Add after other requires
console.log('\nLoaded Routers:');
console.log('Documents Router:', !!documentsRouter);
console.log('Characters Router:', !!charactersRouter);
console.log('Stories Router:', !!storiesRouter);
console.log('Plots Router:', !!plotsRouter);
console.log('Settings Router:', !!settingsRouter);
console.log('Themes Router:', !!themesRouter);