const express = require("express");
const router = express.Router();
const MaterialOrder = require("../models/MaterialOrder");
const { auth, requireRole } = require("../middleware");

// Get all pending orders assigned to this supplier
router.get("/orders", auth, requireRole("supplier"), async (req, res) => {
  try {
    const supplierId = req.user._id;

    const orders = await MaterialOrder.find({ supplierId, status: "pending" })
      .populate("sellerId", "name email shopName")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET SUPPLIER ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve or reject a material order
router.put("/orders/:orderId/decision", auth, requireRole("supplier"), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { decision, estimatedDeliveryDate, trackingInfo, supplierNotes } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision value" });
    }

    const order = await MaterialOrder.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.status = decision;
    if (estimatedDeliveryDate) order.preferredDate = estimatedDeliveryDate;
    if (trackingInfo) order.trackingInfo = trackingInfo;
    if (supplierNotes) order.supplierNotes = supplierNotes;

    await order.save();

    res.json({ message: `Order ${decision} successfully`, order });
  } catch (err) {
    console.error("UPDATE ORDER DECISION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark order as delivered
router.put("/orders/:orderId/deliver", auth, requireRole("supplier"), async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await MaterialOrder.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.status = "delivered";
    await order.save();

    res.json({ message: "Order marked as delivered", order });
  } catch (err) {
    console.error("MARK ORDER DELIVERED ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
