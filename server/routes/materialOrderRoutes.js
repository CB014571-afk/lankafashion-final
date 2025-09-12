
const express = require('express');
const router = express.Router();
const multer = require('multer');
const MaterialOrder = require('../models/MaterialOrder');
const { auth, requireRole } = require('../middleware.js');

// ==================== GET MATERIAL ORDERS FOR SELLER ====================
router.get('/seller/:sellerId([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const orders = await MaterialOrder.find({ sellerId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching material orders for seller:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', auth, requireRole('seller'), upload.single('image'), async (req, res) => {
  try {
    const {
      description,
      quantity,
      preferredDate,
      paymentOption,
      materialCost,
      paymentMethod,
      transactionId,
      paidAt,
      payLaterDueDate,
    } = req.body;

    // Basic validations
    if (!description || !quantity || !preferredDate || !materialCost) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!["payNow", "payLater"].includes(paymentOption)) {
      return res.status(400).json({ message: 'Invalid payment option' });
    }

    let paymentStatus = "pending";
    let paymentDetails = null;
    let payLaterStatus = null;

    if (paymentOption === "payNow") {
      // Require payment details for payNow
      if (!paymentMethod || !transactionId || !paidAt) {
        return res.status(400).json({ message: 'Payment details required for Pay Now option' });
      }
      paymentStatus = "completed";
      paymentDetails = {
        method: paymentMethod,
        transactionId,
        paidAt: new Date(paidAt),
      };
    } else if (paymentOption === "payLater") {
      // Initialize payLater status, approval pending
      payLaterStatus = {
        balanceDue: materialCost,
        dueDate: payLaterDueDate ? new Date(payLaterDueDate) : null,
        approved: false,
      };
    }

    const imageUrl = req.file ? req.file.path : null;

    const order = new MaterialOrder({
      sellerId: req.user.id,
      description,
      quantity,
      preferredDate,
      imageUrl,
      paymentOption,
      materialCost,
      paymentStatus,
      paymentDetails,
      payLaterStatus,
      status: "pending",
    });

    await order.save();

    res.status(201).json({ message: "Material order created", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
