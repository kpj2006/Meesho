const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not defined in environment variables');
      console.error('Please set MONGODB_URI in your .env file');
      process.exit(1);
    }

    // Validate MongoDB URI format
    const uri = process.env.MONGODB_URI;
    if (!uri.includes('mongodb://') && !uri.includes('mongodb+srv://')) {
      console.error('❌ Error: Invalid MongoDB URI format');
      console.error('URI should start with mongodb:// or mongodb+srv://');
      process.exit(1);
    }

    // Connection options with timeout
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(uri, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
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
    
    process.exit(1);
  }
};

module.exports = connectDB;

