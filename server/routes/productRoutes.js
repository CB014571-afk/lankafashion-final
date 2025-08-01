const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, requireRole } = require("../middleware");

// ==================== GET ALL PRODUCTS ====================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort("-createdAt");
    res.json(products);
  } catch (err) {
    console.error("Products list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== GET SELLER'S PRODUCTS ====================
router.get("/mine", auth, requireRole("seller"), async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
    res.json(products);
  } catch (err) {
    console.error("My products error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== ADD PRODUCT ====================
router.post("/add", auth, requireRole("seller"), async (req, res) => {
  try {
    const { name, description, price, category, shopName, images } = req.body;

    const product = await Product.create({
      seller: req.user._id,
      shopName: shopName || req.user.shopName,
      name,
      description,
      price,
      category,
      images: Array.isArray(images) ? images : (images ? images.split(",").map(s => s.trim()) : []),
    });

    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== UPDATE PRODUCT ====================
router.put("/:id", auth, requireRole("seller"), async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== DELETE PRODUCT ====================
router.delete("/:id", auth, requireRole("seller"), async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== SEARCH PRODUCTS ====================
router.get("/search", async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (keyword) query.name = { $regex: keyword, $options: "i" };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).sort("-createdAt");
    res.json(products);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== META DATA ====================
router.get("/meta", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const shopNames = await Product.distinct("shopName");
    res.json({ categories, shopNames });
  } catch (err) {
    console.error("Meta error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
