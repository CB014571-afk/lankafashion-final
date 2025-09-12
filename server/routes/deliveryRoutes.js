const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Delivery = require("../models/Delivery");

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

    // Optional: notify buyer
    try {
      const { notifyBuyerOnDeliveryStatus } = require("../utils/notifyBuyer");
      await notifyBuyerOnDeliveryStatus(delivery, status);
    } catch (e) {
      console.warn("notifyBuyerOnDeliveryStatus failed or not configured:", e?.message);
    }

    res.json(delivery);
  } catch (err) {
    console.error("Error updating delivery:", err);
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
      { proofUrl },
      { new: true }
    );

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    res.status(201).json({ message: "Proof uploaded", proofUrl: delivery.proofUrl });
  } catch (err) {
    console.error("Error uploading proof:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
