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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;