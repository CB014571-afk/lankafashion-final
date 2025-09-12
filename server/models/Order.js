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
        status: { type: String, enum: ["Pending", "Done"], default: "Pending" },
        completedAt: { type: Date }
      }
    ],
    total: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
