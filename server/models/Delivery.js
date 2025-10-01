const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  cardNumber: { type: String },
  expiry: { type: String },
  cvv: { type: String },
  status: { type: String, default: "pending" },
  total: { type: Number, default: 0 },
  items: [{ type: mongoose.Schema.Types.Mixed }],
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Link to the main order
  proofUrl: { type: String }, // URL of uploaded proof image
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Delivery", DeliverySchema);
