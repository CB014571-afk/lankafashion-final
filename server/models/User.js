const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "seller", "buyer", "supplier","driver"], // supplier added here
    default: "buyer",
  },

  // Seller profile fields
  shopName: { type: String, unique: true, trim: true },
  designType: { type: String },
  customizationOptions: { type: [String] },
  description: { type: String },
  contactNumber: { type: String }, // added contact number if needed

  // Recently viewed products (array of product IDs)
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
