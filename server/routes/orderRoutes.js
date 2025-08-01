const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth, requireRole } = require("../middleware");

// ==================== BUYER PLACES ORDER ====================
router.post("/place", auth, requireRole("buyer"), async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items must be a non-empty array" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found for ID: ${item.productId}` });
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        qty: item.quantity,
        price: product.price
      });
    }

    const order = new Order({
      buyer: req.user._id,
      items: orderItems,
      total: totalAmount,
    });

    await order.save();
    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== BUYER VIEWS THEIR ORDERS ====================
router.get("/my-orders", auth, requireRole("buyer"), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching buyer orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== SELLER VIEWS ORDERS FOR THEIR PRODUCTS ====================
router.get("/seller-orders", auth, requireRole("seller"), async (req, res) => {
  try {
    const sellerProducts = await Product.find({ seller: req.user._id }).select("_id");
    const productIds = sellerProducts.map(p => p._id);

    const orders = await Order.find({
      "items.product": { $in: productIds }
    })
      .populate("items.product", "name price")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
