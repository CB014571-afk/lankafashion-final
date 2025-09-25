const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { auth } = require("../middleware.js");

// ==================== TEST ENDPOINT ====================
router.get("/test", (req, res) => {
  res.json({ message: "Order routes are working!", timestamp: new Date() });
});

// ==================== TEST ORDERS WITHOUT AUTH ====================
router.get("/test-orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name price images")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({ 
      message: "Test orders endpoint working", 
      count: orders.length,
      orders: orders.map(o => ({
        _id: o._id,
        buyer: o.buyer,
        total: o.total,
        itemCount: o.items?.length || 0,
        createdAt: o.createdAt
      }))
    });
  } catch (error) {
    console.error("❌ Error in test orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== CREATE NEW ORDER ====================
router.post("/", async (req, res) => {
  try {
    const { buyer, items, total, paymentStatus, status, shippingAddress } = req.body;
    console.log("Creating order with data:", { buyer, items, total, paymentStatus, status, shippingAddress });

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
      total: total,
      paymentStatus: paymentStatus || "pending",
      status: status || "awaiting_payment",
      shippingAddress: shippingAddress || {}
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

// ==================== GET SINGLE ORDER BY ID ====================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("items.product", "name price images")
      .populate("buyer", "name email");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== UPDATE ORDER (for payment status, etc.) ====================
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== GET ORDERS FOR LOGGED-IN BUYER ====================
router.get("/my", auth, async (req, res) => {
  try {
    console.log("🔍 Fetching orders for buyer:", req.user._id);
    
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });
    
    console.log("📊 Found orders for buyer:", orders.length);
    
    // Always return array, even if empty
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching buyer orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

// ==================== TEST AUTH ENDPOINT ====================
router.get("/test-auth", auth, async (req, res) => {
  try {
    console.log("🔍 Test auth endpoint hit by user:", req.user._id);
    res.json({ message: "Auth working", user: { id: req.user._id, email: req.user.email } });
  } catch (error) {
    console.error("❌ Test auth error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== DEBUG: GET ALL ORDERS (NO AUTH) ====================
router.get("/debug/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "name email")
      .populate("items.product", "name price")
      .limit(5)
      .sort({ createdAt: -1 });
    
    const summary = orders.map(order => ({
      id: order._id,
      buyer: order.buyer ? { id: order.buyer._id, email: order.buyer.email } : 'Unknown',
      itemCount: order.items.length,
      total: order.total,
      createdAt: order.createdAt
    }));
    
    res.json({ 
      message: "Debug info", 
      totalOrders: orders.length,
      orders: summary 
    });
  } catch (error) {
    console.error("❌ Debug orders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

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
    // Get orders that have at least one pending item from this seller
    const orders = await Order.find({
      items: { $elemMatch: { seller: sellerObjId, status: "Pending" } }
    })
      .populate("buyer", "name email")
      .populate("items.product", "name price images")
      .lean()
      .sort({ createdAt: -1 });

    const shaped = orders
      .map((o) => {
        // Get all items for this seller (both pending and completed)
        const sellerItems = o.items.filter(i => String(i.seller) === String(sellerId));
        
        // Only show this order if it has at least one pending item
        const hasPendingItems = sellerItems.some(i => i.status === "Pending");
        
        if (!hasPendingItems) return null;
        
        return {
          _id: o._id,
          buyer: o.buyer,
          shippingAddress: o.shippingAddress || null,
          total: o.total,
          createdAt: o.createdAt,
          items: sellerItems.map((i) => ({
            _id: i._id,
            product: i.product,
            qty: i.qty,
            price: i.price,
            status: i.status,
            completedAt: i.completedAt || null,
          })),
        };
      })
      .filter(Boolean);

    console.log(`📊 Pending orders for seller ${sellerId}: ${shaped.length}`);
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
    // Get orders that have items from this seller
    const orders = await Order.find({
      items: { $elemMatch: { seller: sellerObjId } }
    })
      .populate("buyer", "name email")
      .populate("items.product", "name price images")
      .lean();

    const shaped = orders
      .map((o) => {
        // Get all items for this seller
        const sellerItems = o.items.filter(i => String(i.seller) === String(sellerId));
        
        // Only show this order if ALL items from this seller are completed
        const allCompleted = sellerItems.length > 0 && sellerItems.every(i => i.status === "Done");
        
        if (!allCompleted) return null;
        
        const latestCompletedAt = sellerItems
          .map(i => i.completedAt)
          .filter(Boolean)
          .sort((a, b) => new Date(b) - new Date(a))[0] || null;
        
        return {
          _id: o._id,
          buyer: o.buyer,
          shippingAddress: o.shippingAddress || null,
          total: o.total,
          createdAt: o.createdAt,
          completedAt: latestCompletedAt,
          items: sellerItems.map((i) => ({
            _id: i._id,
            product: i.product,
            qty: i.qty,
            price: i.price,
            status: i.status,
            completedAt: i.completedAt || null,
          })),
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));

    console.log(`📊 Completed orders for seller ${sellerId}: ${shaped.length}`);
    res.json(shaped);
  } catch (error) {
    console.error("❌ Error fetching completed orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ==================== MARK AN ORDER ITEM AS DONE ====================
router.put("/:orderId([0-9a-fA-F]{24})/item/:itemId([0-9a-fA-F]{24})/done", async (req, res) => {
  const { orderId, itemId } = req.params;
  console.log("🔄 Server: Marking item as done", { orderId, itemId });
  
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
      console.log("❌ Server: Order or item not found", { orderId, itemId });
      return res.status(404).json({ message: "Order or item not found" });
    }

    console.log("✅ Server: Item marked as done successfully", { orderId, itemId });
    res.json({ message: "Item marked as done", order });
  } catch (error) {
    console.error("❌ Server: Error marking order item as done:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ==================== UPDATE ORDER DELIVERY STATUS ====================
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: " + validStatuses.join(', ') 
      });
    }

    const order = await Order.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`✅ Order ${id} status updated to: ${status}`);
    res.json({ 
      message: `Order status updated to ${status}`, 
      order: { _id: order._id, status: order.status } 
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
