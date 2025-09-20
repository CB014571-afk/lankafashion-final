// server/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB, closeDB } = require("./db");

dotenv.config();

const app = express();

// --- CORS CONFIG ---
const VERCEL_PROJECT = "lankafashion-final"; // your project prefix
const PROD_DOMAIN = `https://${VERCEL_PROJECT}.vercel.app`;

function isAllowedOrigin(origin) {
  if (!origin) return true; // allow curl/postman/server-to-server
  try {
    const url = new URL(origin);
    return (
      origin === "http://localhost:5173" || // local dev
      origin === PROD_DOMAIN || // prod domain
      (url.hostname.endsWith(".vercel.app") &&
        url.hostname.startsWith(VERCEL_PROJECT)) // preview deployments
    );
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: false, // ❗ set true ONLY if you actually use cookies/sessions
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors()); // handle preflight

app.use(express.json());

// Health & root
app.get("/health", (_req, res) => res.send("ok"));
app.get("/", (_req, res) => res.send("🚀 Server is running and ready!"));

// --- Routes ---
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const preOrderRoutes = require("./routes/preOrderRoutes");
const shopRoutes = require("./routes/shopRoutes");
const materialOrderRoutes = require("./routes/materialOrderRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/preorder", preOrderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/material-orders", materialOrderRoutes);

// ---- Idempotent startup (prevents EADDRINUSE) ----
let serverInstance = null;
global.__LF_SERVER_STARTED__ = global.__LF_SERVER_STARTED__ || false;

async function start() {
  try {
    await connectDB();

    if (!global.__LF_SERVER_STARTED__) {
  const PORT = process.env.PORT || 5000; // Use 5000 for local dev, Render provides PORT
      serverInstance = app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
      global.__LF_SERVER_STARTED__ = true;
    }
  } catch (err) {
    console.error("❌ Startup Error:", err?.message || err);
    process.exit(1);
  }
}

// Only autostart when this file is the entry point
if (require.main === module) {
  start();
}

// Export for tests or tooling without auto-starting
module.exports = { app, start };

// Graceful shutdown (Render sends SIGTERM)
process.on("SIGTERM", async () => {
  try {
    if (serverInstance) serverInstance.close();
    await closeDB();
  } finally {
    process.exit(0);
  }
});
