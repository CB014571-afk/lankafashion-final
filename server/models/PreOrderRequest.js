const mongoose = require("mongoose");

const PreOrderRequestSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  materialName: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  quantity: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  paymentOption: { type: String, enum: ["pay_now", "pay_later"], required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected", "paid", "overdue", "cancelled", "delivered"], default: "pending" },
  supplierNotes: { type: String },
  supplierResponse: {
    accepted: { type: Boolean },
    price: { type: Number },
    respondedAt: { type: Date }
  },
  paymentDueDate: { type: Date },
  paid: { type: Boolean, default: false },
  paymentDate: { type: Date },
  cancelStatus: { type: Boolean, default: false },
  deliveryStatus: { type: String, enum: ["pending", "in_progress", "delivered"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PreOrderRequest", PreOrderRequestSchema);
