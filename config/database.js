const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || "mongodb+srv://nazmulhossenmain:u2n6U3zdh7QJ12ut@subban.ir6djs8.mongodb.net/?retryWrites=true&w=majority&appName=subban";

const mongooseOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

async function connectToDatabase() {
  try {
    await mongoose.connect(uri, mongooseOptions);
    console.log("✅ Successfully connected to MongoDB with Mongoose!");
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log("✅ Database ping successful!");
    
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function disconnectFromDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
    }
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  mongoose
}; 