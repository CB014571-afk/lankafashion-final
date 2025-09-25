// Test API endpoints directly
require('dotenv').config();
const mongoose = require('mongoose');
const PreOrderRequest = require('./models/PreOrderRequest');
const User = require('./models/User');

async function testAPIEndpoints() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Direct database query
    const pendingFromDB = await PreOrderRequest.find({ status: "pending" });
    console.log(`\n📋 Direct DB Query - Pending Pre-Orders: ${pendingFromDB.length}`);
    
    // Test 2: Check if there are any suppliers in the database
    const suppliers = await User.find({ role: "supplier" });
    console.log(`👤 Suppliers in database: ${suppliers.length}`);
    
    if (suppliers.length > 0) {
      console.log('Supplier emails:');
      suppliers.forEach(s => console.log(`  - ${s.email}`));
    }

    // Test 3: Simulate the exact API call the frontend makes
    console.log('\n🔍 Simulating API call: PreOrderRequest.find({ status: "pending" })');
    const apiResult = await PreOrderRequest.find({ status: "pending" });
    console.log(`Result count: ${apiResult.length}`);
    
    if (apiResult.length > 0) {
      console.log('Sample result:');
      console.log(`  Material: ${apiResult[0].materialName}`);
      console.log(`  Status: ${apiResult[0].status}`);
      console.log(`  Seller ID: ${apiResult[0].sellerId}`);
      console.log(`  Created: ${apiResult[0].createdAt}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ API test complete');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAPIEndpoints();