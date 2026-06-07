const mongoose = require("mongoose");

async function connectDB() {
  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clothing_crm";
  try {
    await mongoose.connect(uri);
    console.log(`[DB] MongoDB ulandi: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("[DB] Ulanish xatosi:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
