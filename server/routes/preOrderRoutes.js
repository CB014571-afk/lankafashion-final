const express = require("express");
const router = express.Router();
const PreOrderRequest = require("../models/PreOrderRequest");
const { auth, requireRole } = require("../middleware");

// Supplier fetches accepted preorders
router.get("/accepted", auth, requireRole("supplier"), async (req, res) => {
  try {
    const preorders = await PreOrderRequest.find({ status: "accepted" });
    res.json(preorders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching accepted preorders", error: err });
  }
});

// Supplier fetches rejected preorders
router.get("/rejected", auth, requireRole("supplier"), async (req, res) => {
  try {
    const preorders = await PreOrderRequest.find({ status: "rejected" });
    res.json(preorders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rejected preorders", error: err });
  }
});

// Supplier marks delivery as complete
router.patch('/:id/deliver', auth, requireRole('supplier'), async (req, res) => {
  try {
    const preorder = await PreOrderRequest.findByIdAndUpdate(
      req.params.id,
      { deliveryStatus: 'delivered', status: 'delivered' },
      { new: true }
    );
    res.json(preorder);
  } catch (err) {
    res.status(500).json({ message: 'Error marking delivery', error: err });
  }
});

// Mark overdue preorders (run as a scheduled job or endpoint)
router.patch('/mark-overdue', async (req, res) => {
  try {
    const now = new Date();
    const overdue = await PreOrderRequest.updateMany(
      {
        paymentOption: 'pay_later',
        paid: false,
        paymentDueDate: { $lt: now },
        status: { $nin: ['paid', 'cancelled', 'rejected'] }
      },
      { status: 'overdue' }
    );
    res.json({ message: 'Marked overdue', result: overdue });
  } catch (err) {
    res.status(500).json({ message: 'Error marking overdue', error: err });
  }
});

// Seller fetches their own preorders
router.get("/seller/:sellerId", auth, requireRole("seller"), async (req, res) => {
  try {
    const preorders = await PreOrderRequest.find({ sellerId: req.params.sellerId });
    res.json(preorders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching seller preorders", error: err });
  }
});

// Seller submits a preorder request
router.post("/submit", auth, requireRole("seller"), async (req, res) => {
  try {
    let paymentDueDate = undefined;
    if (req.body.paymentOption === 'pay_later') {
      const now = new Date();
      paymentDueDate = new Date(now.setMonth(now.getMonth() + 1));
    }
    const preorder = new PreOrderRequest({ ...req.body, sellerId: req.user._id, paymentDueDate });
    await preorder.save();
    res.status(201).json(preorder);
  } catch (err) {
    res.status(500).json({ message: "Error submitting preorder", error: err });
  }
});

// Supplier fetches all pending preorders
router.get("/pending", auth, requireRole("supplier"), async (req, res) => {
  try {
    const preorders = await PreOrderRequest.find({ status: "pending" });
    res.json(preorders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching preorders", error: err });
  }
});

// Supplier accepts/rejects preorder
router.patch("/:id/action", auth, requireRole("supplier"), async (req, res) => {
  try {
    const { action, supplierNotes, paymentDueDate, price } = req.body;
    const update = { supplierNotes };
    if (action === "accept") {
      update.status = "accepted";
      update.supplierId = req.user._id;
      if (paymentDueDate) update.paymentDueDate = paymentDueDate;
      update["supplierResponse.accepted"] = true;
      update["supplierResponse.price"] = price;
      update["supplierResponse.respondedAt"] = new Date();
    } else if (action === "reject") {
      update.status = "rejected";
      update.supplierId = req.user._id;
      update["supplierResponse.accepted"] = false;
      update["supplierResponse.respondedAt"] = new Date();
    }
    const preorder = await PreOrderRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(preorder);
  } catch (err) {
    res.status(500).json({ message: "Error updating preorder", error: err });
  }
});

// Seller pays for preorder
router.patch("/:id/pay", auth, requireRole("seller"), async (req, res) => {
  try {
    // Set paid, status, paymentDate, and deliveryStatus (in_progress)
    const preorder = await PreOrderRequest.findByIdAndUpdate(
      req.params.id,
      {
        paid: true,
        status: "paid",
        paymentDate: new Date(),
        deliveryStatus: "in_progress"
      },
      { new: true }
    );
    res.json(preorder);
  } catch (err) {
    res.status(500).json({ message: "Error processing payment", error: err });
  }
});

// Restrict seller if overdue
router.get("/overdue/:sellerId", auth, requireRole("seller"), async (req, res) => {
  try {
    const overdue = await PreOrderRequest.find({ sellerId: req.params.sellerId, status: "overdue" });
    res.json({ restricted: overdue.length > 0 });
  } catch (err) {
    res.status(500).json({ message: "Error checking overdue", error: err });
  }
});
// Seller deletes their own preorder
router.delete("/:id", auth, requireRole("seller"), async (req, res) => {
  try {
    const preorder = await PreOrderRequest.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
    if (!preorder) {
      return res.status(404).json({ message: "Preorder not found or not authorized" });
    }
    res.json({ message: "Preorder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting preorder", error: err });
  }
});

module.exports = router;
