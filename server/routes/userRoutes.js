const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Product = require("../models/Product");
const { auth, requireRole } = require("../middleware"); // make sure your middleware exports these

// ==================== REGISTER ====================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role, // "buyer" | "seller" | "admin"
      shopName,
      designType,
      customizationOptions,
      description,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "buyer",
      // seller-only fields (they'll just be undefined for buyers)
      shopName,
      designType,
      customizationOptions,
      description,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        description: user.description,
        designType: user.designType,
        customizationOptions: user.customizationOptions,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== GET MY PROFILE ====================
router.get("/profile", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select("-password");
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== UPDATE MY PROFILE ====================
router.put("/profile", auth, async (req, res) => {
  try {
    // Allow updating general + seller fields
    const updates = {
      name: req.body.name,
      email: req.body.email,
      shopName: req.body.shopName,
      designType: req.body.designType,
      customizationOptions: req.body.customizationOptions,
      description: req.body.description,
    };

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json(updated);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== CHANGE PASSWORD ====================
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both current and new password are required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== PUBLIC: GET SELLER PAGE BY shopName ====================
router.get("/sellers/:shopName", async (req, res) => {
  try {
    const shopName = decodeURIComponent(req.params.shopName);

    const seller = await User.findOne({ shopName, role: "seller" }).select("-password");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const products = await Product.find({ shopName });

    res.json({ seller, products });
  } catch (err) {
    console.error("GET SELLER PAGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== OPTIONAL: ADMIN – list all users ====================
// router.get("/admin/users", auth, requireRole("admin"), async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (err) {
//     console.error("ADMIN USERS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

module.exports = router;
