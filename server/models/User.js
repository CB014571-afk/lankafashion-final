const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "seller", "buyer"],
    default: "buyer",
  },

  // Additional fields for seller profile
  shopName: {
    type: String,
  },
  designType: {
    type: String,
  },
  customizationOptions: {
    type: [String], // array of options like ['customSize', 'uploadInspo']
  },
  description: {
    type: String,
  },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
