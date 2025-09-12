const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const mongoose = require("mongoose");

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

// Get best seller information
router.get("/best-seller", async (req, res) => {
  try {
    // Aggregate orders to find the seller with most sales
    const bestSeller = await Order.aggregate([
      // Unwind the items array to get one document per item
      { $unwind: "$items" },
      // Group by seller and count total items sold
      {
        $group: {
          _id: "$items.seller",
          totalItemsSold: { $sum: "$items.qty" },
          totalAmount: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
        }
      },
      // Sort by total items sold in descending order
      { $sort: { totalItemsSold: -1 } },
      // Limit to 1 result (the best seller)
      { $limit: 1 },
      // Lookup seller details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "sellerDetails"
        }
      },
      // Unwind the seller details
      { $unwind: "$sellerDetails" },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          totalItemsSold: 1,
          totalAmount: 1,
          shopName: "$sellerDetails.shopName",
          name: "$sellerDetails.name"
        }
      }
    ]);

    if (!bestSeller.length) {
      return res.status(404).json({ message: "No seller data found" });
    }

    res.json(bestSeller[0]);
  } catch (err) {
    console.error("Error finding best seller:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
