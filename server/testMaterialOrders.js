// Test script to check material orders in database
require('dotenv').config();
const mongoose = require('mongoose');
const MaterialOrder = require('./models/MaterialOrder');

async function checkMaterialOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const allOrders = await MaterialOrder.find({});
    console.log('📋 Total Material Orders:', allOrders.length);
    
    if (allOrders.length > 0) {
      allOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order._id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Supplier ID: ${order.supplierId}`);
        console.log(`   Seller ID: ${order.sellerId}`);
        console.log(`   Created: ${order.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No material orders found');
    }

    const pendingOrders = await MaterialOrder.find({ status: 'pending' });
    console.log('🔄 Pending Material Orders:', pendingOrders.length);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkMaterialOrders();