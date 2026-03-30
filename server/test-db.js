const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const mongoUri = process.env.MONGO_URI;
console.log("Testing MongoDB connection...");

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("MongoDB connected successfully!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });