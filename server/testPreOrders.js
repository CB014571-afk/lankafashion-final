// Test script to check pre-order data in database
require('dotenv').config();
const mongoose = require('mongoose');
const PreOrderRequest = require('./models/PreOrderRequest');

async function testPreOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check all pre-orders in database
    const allPreOrders = await PreOrderRequest.find({});
    console.log('\n📋 All Pre-Orders in Database:');
    console.log(`Total count: ${allPreOrders.length}`);
    
    if (allPreOrders.length > 0) {
      allPreOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Pre-Order ID: ${order._id}`);
        console.log(`   Material: ${order.materialName}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Seller ID: ${order.sellerId}`);
        console.log(`   Created: ${order.createdAt}`);
      });
    } else {
      console.log('❌ No pre-orders found in database');
    }

    // Check specifically pending pre-orders
    const pendingPreOrders = await PreOrderRequest.find({ status: "pending" });
    console.log(`\n🔄 Pending Pre-Orders: ${pendingPreOrders.length}`);
    
    if (pendingPreOrders.length > 0) {
      pendingPreOrders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.materialName} - ${order.status}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPreOrders();