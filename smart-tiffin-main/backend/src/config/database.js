const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no external MongoDB URI or using default localhost, try memory server
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      try {
        // First try connecting to the configured/default URI
        if (uri) {
          await mongoose.connect(uri);
          console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
          setupEventHandlers();
          return;
        }
      } catch {
        console.log('⚠️  Local MongoDB not available, starting in-memory MongoDB...');
      }

      // Fall back to mongodb-memory-server
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('🧪 Using in-memory MongoDB for development');
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    setupEventHandlers();

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

function setupEventHandlers() {
  // Handle connection events
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
}

module.exports = connectDB;
