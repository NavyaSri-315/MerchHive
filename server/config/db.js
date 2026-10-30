const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bulkconnect', {
      // Modern mongoose options are defaults in Mongoose 8
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Fallback or exit depending on deployment
    process.exit(1);
  }
};

module.exports = connectDB;
