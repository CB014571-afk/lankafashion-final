const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");

// Get shop details & products
router.get("/:shopName", async (req, res) => {
  console.log("📥 GET /api/shops/:shopName hit");

  try {
    const shopName = decodeURIComponent(req.params.shopName).trim();

    // Validate manually
    if (!/^[a-zA-Z0-9\-\_\s]+$/.test(shopName)) {
      return res.status(400).json({ message: "Invalid shop name format" });
    }

    const seller = await User.findOne({
      shopName: { $regex: `^${shopName}$`, $options: "i" },
      role: "seller"
    });

    if (!seller) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const products = await Product.find({
      shopName: { $regex: `^${shopName}$`, $options: "i" }
    }).sort("-createdAt");

    res.json({
      shopName: seller.shopName.trim(),
      description: seller.description || "",
      email: seller.email || "",
      contactNumber: seller.contactNumber || "",
      products
    });
  } catch (err) {
    console.error("❌ Error fetching shop details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
