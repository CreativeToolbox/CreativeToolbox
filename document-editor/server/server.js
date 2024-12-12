require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const documentsRouter = require('./routes/documents');
const charactersRouter = require('./routes/characters');
const storiesRouter = require('./routes/stories');
const plotsRouter = require('./routes/plots');
const settingsRouter = require('./routes/settings');
const themesRouter = require('./routes/themes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
if (process.env.NODE_ENV === 'production') {
  app.use(helmet()); // Adds various HTTP headers for security
  
  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  }));
}

// Compression middleware
app.use(compression()); // Compress all responses

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Trust proxy - needed for rate limiting behind reverse proxies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Routes
app.use('/api/documents', documentsRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/plots', plotsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/themes', themesRouter);

// Basic route for API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
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