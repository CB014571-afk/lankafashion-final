// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware");

// ==================== REGISTER (auto-login) ====================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role, // buyer | seller | admin, driver
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

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "buyer",
      shopName,
      designType,
      customizationOptions,
      description,
    });

    // 🔑 issue JWT so the user is authenticated immediately after register
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      role: user.role,
      userId: user._id.toString(),
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
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.error("LOGIN ERROR: User not found for email", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      console.error("LOGIN ERROR: User has no password field", user);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.error("LOGIN ERROR: Password mismatch for user", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("LOGIN ERROR: JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server error: JWT secret missing" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
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
    return res.status(500).json({ message: "Server error" });
  }
});

// ==================== GET PROFILE ====================
router.get("/profile", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select("-password");
    if (!me) return res.status(404).json({ message: "User not found" });
    return res.json(me);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ==================== UPDATE PROFILE ====================
router.put("/profile", auth, async (req, res) => {
  try {
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

    return res.json(updated);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
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

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ==================== GET RECENTLY VIEWED PRODUCTS ====================
router.get("/recently-viewed", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed');
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ recentlyViewed: user.recentlyViewed });
  } catch (err) {
    console.error("GET RECENTLY VIEWED ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ==================== UPDATE RECENTLY VIEWED PRODUCTS ====================
router.post("/recently-viewed", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID required" });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Add productId to the front, remove duplicates, keep last 10
    let viewed = user.recentlyViewed.map(id => id.toString());
    viewed = [productId, ...viewed.filter(id => id !== productId)].slice(0, 10);
    user.recentlyViewed = viewed;
    await user.save();
    return res.json({ recentlyViewed: user.recentlyViewed });
  } catch (err) {
    console.error("UPDATE RECENTLY VIEWED ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
