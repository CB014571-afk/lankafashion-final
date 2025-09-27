const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        ukSize: { type: String }, // UK size for clothing items
        specialRequest: { type: String }, // Special requests from customer
        status: { type: String, enum: ["Pending", "Done"], default: "Pending" },
        completedAt: { type: Date }
      }
    ],
    total: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["awaiting_payment", "confirmed", "processing", "shipped", "delivered", "cancelled"], 
      default: "awaiting_payment" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed", "refunded"], 
      default: "pending" 
    },
    paymentIntentId: { type: String }, // Stripe payment intent ID
    shippingAddress: {
      name: { type: String },
      address: { type: String },
      email: { type: String },
      phone: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
