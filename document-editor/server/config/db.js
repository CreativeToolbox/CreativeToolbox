const mongoose = require('mongoose');

const validateDbName = (dbName) => {
  // List of allowed database names
  const allowedDatabases = ['documents_db', 'documents_db_dev', 'documents_db_test'];
  
  if (!allowedDatabases.includes(dbName)) {
    console.error(`Warning: Connected to unexpected database "${dbName}"`);
    console.error(`Expected one of: ${allowedDatabases.join(', ')}`);
    
    // Optional: Force exit if wrong database
    // process.exit(1);
  }
};

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // Validate database name
    validateDbName(conn.connection.name);
    
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    process.exit(1);
  }
};

module.exports = connectDB;