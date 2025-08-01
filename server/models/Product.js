const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true }, // use "name" instead of "title"
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    images: [String], // array of image URLs
    shopName: { type: String }, // shop name of the seller
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
