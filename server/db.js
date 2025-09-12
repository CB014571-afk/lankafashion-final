// server/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

let isConnecting = false;
let hasConnected = false;

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  // already connected?
  if (hasConnected || mongoose.connection.readyState === 1) return;

  // someone else is connecting — wait for it
  if (isConnecting) {
    await new Promise((resolve, reject) => {
      const onOpen = () => { cleanup(); resolve(); };
      const onErr  = (e) => { cleanup(); reject(e); };
      const cleanup = () => {
        mongoose.connection.off("open", onOpen);
        mongoose.connection.off("error", onErr);
      };
      mongoose.connection.once("open", onOpen);
      mongoose.connection.once("error", onErr);
    });
    return;
  }

  isConnecting = true;
  await mongoose.connect(process.env.MONGO_URI); // Mongoose v6+: no legacy options
  isConnecting = false;
  hasConnected = true;

  console.log("✅ MongoDB Connected");
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

mongoose.connection.on("disconnected", () => console.log("ℹ️ MongoDB disconnected"));
mongoose.connection.on("reconnected",  () => console.log("ℹ️ MongoDB reconnected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err.message));

module.exports = { connectDB, closeDB };
