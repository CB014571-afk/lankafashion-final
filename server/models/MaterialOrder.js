
const mongoose = require("mongoose");

const MaterialOrderSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: "pending" },
  materialName: { type: String },
  quantity: { type: Number },
  preferredDate: { type: Date },
  paymentOption: { type: String },
  trackingInfo: { type: String },
  supplierNotes: { type: String },
  // Add other fields as needed
}, { timestamps: true });

module.exports = mongoose.model("MaterialOrder", MaterialOrderSchema);
