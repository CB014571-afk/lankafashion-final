require("dotenv").config();
const mongoose = require("mongoose");
const PreOrderRequest = require("./models/PreOrderRequest");
const User = require("./models/User");

async function testSupplierAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find supplier user
    const supplier = await User.findOne({ role: "supplier" });
    console.log("🔍 Supplier found:", supplier ? "Yes" : "No");
    if (supplier) {
      console.log("   Email:", supplier.email);
      console.log("   ID:", supplier._id);
    }

    // Test pending pre-orders endpoint logic
    console.log("\n📋 Testing /preorder/pending endpoint logic:");
    const pendingPreorders = await PreOrderRequest.find({ status: "pending" });
    console.log("Pending pre-orders count:", pendingPreorders.length);
    
    pendingPreorders.forEach((preorder, index) => {
      console.log(`${index + 1}. ${preorder.materialName} (${preorder.quantity}) - Status: ${preorder.status}`);
      console.log(`   Email: ${preorder.email}`);
      console.log(`   Contact: ${preorder.contactNumber}`);
      console.log(`   Seller ID: ${preorder.sellerId}`);
      console.log(`   Created: ${preorder.createdAt}`);
      console.log();
    });

    // Test accepted pre-orders
    console.log("📋 Testing /preorder/accepted endpoint logic:");
    const acceptedPreorders = await PreOrderRequest.find({ status: "accepted" });
    console.log("Accepted pre-orders count:", acceptedPreorders.length);

    // Test rejected pre-orders  
    console.log("📋 Testing /preorder/rejected endpoint logic:");
    const rejectedPreorders = await PreOrderRequest.find({ status: "rejected" });
    console.log("Rejected pre-orders count:", rejectedPreorders.length);

    console.log("\n✅ API endpoint logic test complete");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testSupplierAPI();