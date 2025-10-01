const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

// IMPORTANT: if you send base64 images, increase json limit in your main app:
// app.use(express.json({ limit: "10mb" })); // in server.js/app.js

// Get all deliveries
router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort("-createdAt").lean();
    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Store delivery details
router.post("/", async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json({ message: "Delivery details stored", delivery });
  } catch (err) {
    console.error("Error storing delivery details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update delivery status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid delivery ID format" });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    // ✅ UPDATE ORDER PAYMENT STATUS FOR CASH ON DELIVERY WHEN COMPLETED
    if (status === 'completed' && delivery.orderId && delivery.paymentMethod === 'cash') {
      try {
        console.log(`🔄 Updating payment status for completed cash order: ${delivery.orderId}`);
        
        const updatedOrder = await Order.findByIdAndUpdate(
          delivery.orderId,
          { 
            paymentStatus: 'paid',
            status: 'delivered'
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log(`✅ Order ${delivery.orderId} payment status updated to 'paid'`);
          
          // Send notification to buyer about payment completion
          try {
            await Notification.create({
              userId: delivery.buyer,
              message: `✅ Payment confirmed! Your cash on delivery payment of Rs ${delivery.total?.toLocaleString() || 'N/A'} has been collected. Order delivered successfully.`,
              type: "payment_confirmed",
              relatedId: delivery.orderId
            });
            console.log(`📧 Payment confirmation notification sent to buyer`);
          } catch (notifError) {
            console.warn("⚠️ Failed to send payment notification:", notifError.message);
          }
        } else {
          console.warn(`⚠️ Order ${delivery.orderId} not found for payment status update`);
        }
      } catch (orderUpdateError) {
        console.error("❌ Error updating order payment status:", orderUpdateError);
        // Don't fail the delivery status update if order update fails
      }
    }

    // Optional: notify buyer
    try {
      const { notifyBuyerOnDeliveryStatus } = require("../utils/notifyBuyer");
      await notifyBuyerOnDeliveryStatus(delivery, status);
    } catch (e) {
      console.warn("notifyBuyerOnDeliveryStatus failed or not configured:", e?.message);
    }

    res.json({
      ...delivery.toObject(),
      paymentStatusUpdated: status === 'completed' && delivery.paymentMethod === 'cash'
    });
  } catch (err) {
    console.error("Error updating delivery:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept delivery (PATCH method specifically for drivers accepting deliveries)
router.patch("/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid delivery ID format" });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true }
    );

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    // Optional: notify buyer
    try {
      const { notifyBuyerOnDeliveryStatus } = require("../utils/notifyBuyer");
      await notifyBuyerOnDeliveryStatus(delivery, 'accepted');
    } catch (e) {
      console.warn("notifyBuyerOnDeliveryStatus failed or not configured:", e?.message);
    }

    res.json(delivery);
  } catch (err) {
    console.error("Error accepting delivery:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload proof of delivery (accepts base64 or URL)
router.post("/:id/proof", async (req, res) => {
  try {
    const { id } = req.params;
    const { proofUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid delivery ID format" });
    }
    if (!proofUrl) {
      return res.status(400).json({ message: "No proof image provided" });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { 
        proofUrl,
        status: 'completed'  // Automatically mark as completed when proof is uploaded
      },
      { new: true }
    );

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    // ✅ UPDATE ORDER PAYMENT STATUS FOR CASH ON DELIVERY
    if (delivery.orderId && delivery.paymentMethod === 'cash') {
      try {
        console.log(`🔄 Updating payment status for cash order: ${delivery.orderId}`);
        
        const updatedOrder = await Order.findByIdAndUpdate(
          delivery.orderId,
          { 
            paymentStatus: 'paid',
            status: 'delivered'
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log(`✅ Order ${delivery.orderId} payment status updated to 'paid'`);
          
          // Send notification to buyer about payment completion
          try {
            await Notification.create({
              userId: delivery.buyer,
              message: `✅ Payment confirmed! Your cash on delivery payment of Rs ${delivery.total?.toLocaleString() || 'N/A'} has been collected. Order delivered successfully.`,
              type: "payment_confirmed",
              relatedId: delivery.orderId
            });
            console.log(`📧 Payment confirmation notification sent to buyer`);
          } catch (notifError) {
            console.warn("⚠️ Failed to send payment notification:", notifError.message);
          }
        } else {
          console.warn(`⚠️ Order ${delivery.orderId} not found for payment status update`);
        }
      } catch (orderUpdateError) {
        console.error("❌ Error updating order payment status:", orderUpdateError);
        // Don't fail the delivery completion if order update fails
      }
    }

    // Optional: notify buyer about completion
    try {
      const { notifyBuyerOnDeliveryStatus } = require("../utils/notifyBuyer");
      await notifyBuyerOnDeliveryStatus(delivery, 'completed');
    } catch (e) {
      console.warn("notifyBuyerOnDeliveryStatus failed or not configured:", e?.message);
    }

    res.status(201).json({ 
      message: "Proof uploaded and delivery completed", 
      proofUrl: delivery.proofUrl,
      paymentStatusUpdated: delivery.paymentMethod === 'cash'
    });
  } catch (err) {
    console.error("Error uploading proof:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
