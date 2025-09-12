const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { auth } = require("../middleware.js");
// ==================== CREATE NEW ORDER ====================
router.post("/", async (req, res) => {
  try {
    const { buyer, items, total } = req.body;
    console.log("Creating order with data:", { buyer, items, total });

    if (!buyer || !items || !Array.isArray(items) || items.length === 0 || !total) {
      console.log("Missing required fields:", { buyer, items, total });
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const order = new Order({
      buyer: buyer,
      items: items.map(item => ({
        product: item.product,
        seller: item.seller,
        qty: item.qty,
        price: item.price,
        status: "Pending"
      })),
      total: total
    });

    console.log("Order object created:", order);
    await order.save();
    console.log("Order saved successfully:", order._id);
    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    console.error("Error details:", error.message);
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// ==================== GET ORDERS FOR LOGGED-IN BUYER ====================
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching buyer orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ==================== GET ORDERS FOR SELLER ====================
router.get("/seller/:sellerId", auth, async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const orders = await Order.find({ "items.seller": sellerId })
      .populate("items.product", "name price images")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });
    
    // Filter items to only include those for this seller
    const sellerOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => String(item.seller) === String(sellerId))
    }));
    
    res.json(sellerOrders);
  } catch (error) {
    console.error("❌ Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

console.log("✅ orderRoutes.js file loaded");

// Helper: keep only items for this seller
function shapeForSeller(order, sellerId, statusFilter) {
  const items = order.items.filter(
    (i) => String(i.seller) === String(sellerId) &&
           (!statusFilter || i.status === statusFilter)
  );

  if (items.length === 0) return null;

  const completedAt =
    items
      .map((i) => i.completedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] || null;

  return {
    _id: order._id,
    buyer: order.buyer,
    shippingAddress: order.shippingAddress || null,
    total: order.total,
    createdAt: order.createdAt,
    completedAt,
    items: items.map((i) => ({
      _id: i._id,
      product: i.product,
      qty: i.qty,
      price: i.price,
      status: i.status,
      completedAt: i.completedAt || null,
    })),
  };
}

// ==================== GET PENDING ORDERS FOR SELLER ====================
router.get("/seller/:sellerId([0-9a-fA-F]{24})", async (req, res) => {
  const sellerId = req.params.sellerId;
  const sellerObjId = new mongoose.Types.ObjectId(sellerId);
  try {
    const orders = await Order.find({
      items: { $elemMatch: { seller: sellerObjId, status: "Pending" } }, // ✅ FIXED
    })
      .populate("buyer", "name email")
      .populate("items.product", "name price images")
      .lean()
      .sort({ createdAt: -1 });

    const shaped = orders
      .map((o) => shapeForSeller(o, sellerId, "Pending"))
      .filter(Boolean);

    res.json(shaped);
  } catch (error) {
    console.error("❌ Error fetching pending orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ==================== GET COMPLETED ORDERS FOR SELLER ====================
router.get("/seller/:sellerId([0-9a-fA-F]{24})/completed", async (req, res) => {
  const sellerId = req.params.sellerId;
  const sellerObjId = new mongoose.Types.ObjectId(sellerId);
  try {
    const orders = await Order.find({
      items: { $elemMatch: { seller: sellerObjId, status: "Done" } }, // ✅ FIXED
    })
      .populate("buyer", "name email")
      .populate("items.product", "name price images")
      .lean();

    const shaped = orders
      .map((o) => shapeForSeller(o, sellerId, "Done"))
      .filter(Boolean)
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));

    res.json(shaped);
  } catch (error) {
    console.error("❌ Error fetching completed orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ==================== MARK AN ORDER ITEM AS DONE ====================
router.put("/:orderId([0-9a-fA-F]{24})/item/:itemId([0-9a-fA-F]{24})/done", async (req, res) => {
  const { orderId, itemId } = req.params;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, "items._id": itemId },
      {
        $set: {
          "items.$.status": "Done",
          "items.$.completedAt": new Date(),
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order or item not found" });
    }

    res.json({ message: "Item marked as done", order });
  } catch (error) {
    console.error("❌ Error marking order item as done:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
