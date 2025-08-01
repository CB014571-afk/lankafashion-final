const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const MaterialRequest = require("../models/MaterialRequest");
const { auth, requireRole } = require("../middleware");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Get the file extension
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// ==================== POST MATERIAL REQUEST ====================
router.post("/materials", auth, requireRole("seller"), upload.single("image"), async (req, res) => {
  try {
    console.log("🔸 Incoming request to /materials")  // Log the request
    console.log("🔸 req.user:", req.user);
    console.log("🔸 req.body:", req.body);

    const { description, quantity, preferredDate } = req.body; // Destructure the body
    const imageURL = req.file ? `/uploads/${req.file.filename}` : ""; // Use the uploaded file's path

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - no user found" });
    }

    const newRequest = await MaterialRequest.create({
      seller: req.user._id,
      description,
      quantity,
      preferredDate,
      imageURL,
    });

    console.log("✅ Saved Material Request:", newRequest); // Log the saved request
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Material Request Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
