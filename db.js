// db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Create a .env file with your MongoDB Atlas connection string
// Example .env file content:
// MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-dashboard?retryWrites=true&w=majority

async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB Atlas successfully!');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

module.exports = { connectToDatabase };

// How to use this module:
// 1. Create a .env file with your MONGODB_URI
// 2. In your server.js file, add:

/*
const { connectToDatabase } = require('./db');

// Start the server only after attempting to connect to MongoDB
async function startServer() {
  const isConnected = await connectToDatabase();
  
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with MongoDB connection`);
    });
  } else {
    console.log(`Server running on port ${PORT} without MongoDB connection (using localStorage)`);
    app.listen(PORT);
  }
}

startServer();
*/