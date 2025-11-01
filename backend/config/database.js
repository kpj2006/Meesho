const mongoose = require('mongoose');

// Cache the connection to prevent multiple connections in serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    // If already connected, return cached connection
    if (cached.conn) {
      return cached.conn;
    }

    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not defined in environment variables');
      console.error('Please set MONGODB_URI in your .env file');
      throw new Error('MONGODB_URI is not defined');
    }

    // Validate MongoDB URI format
    const uri = process.env.MONGODB_URI;
    if (!uri.includes('mongodb://') && !uri.includes('mongodb+srv://')) {
      console.error('❌ Error: Invalid MongoDB URI format');
      console.error('URI should start with mongodb:// or mongodb+srv://');
      throw new Error('Invalid MongoDB URI format');
    }

    // Connection options with timeout (optimized for serverless)
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };

    // If connection is in progress, wait for it
    if (!cached.promise) {
      cached.promise = mongoose.connect(uri, options).then((conn) => {
        return conn;
      });
    }

    cached.conn = await cached.promise;

    console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('💡 This might be a DNS resolution issue. Check:');
      console.error('   1. Your internet connection');
      console.error('   2. MongoDB Atlas cluster is running');
      console.error('   3. Your IP address is whitelisted in MongoDB Atlas');
      console.error('   4. MongoDB URI format is correct');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Authentication failed. Check:');
      console.error('   1. MongoDB username and password are correct');
      console.error('   2. Database user has proper permissions');
    } else if (error.message.includes('SRV')) {
      console.error('💡 SRV record not found. Check:');
      console.error('   1. MongoDB Atlas cluster name is correct');
      console.error('   2. Using correct connection string format');
    }
    
    console.error('\n📝 To fix:');
    console.error('   1. Check your .env file has correct MONGODB_URI');
    console.error('   2. Format: mongodb+srv://username:password@cluster.mongodb.net/database');
    console.error('   3. For local: mongodb://localhost:27017/prodsync');
    
    // Don't exit in serverless environment
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;

