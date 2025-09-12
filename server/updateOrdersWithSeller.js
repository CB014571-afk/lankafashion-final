// updateOrdersWithSeller.js
// Run this script with: node updateOrdersWithSeller.js

const mongoose = require('mongoose');
const Order = require('./models/Order'); // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lankafashion';
const SELLER_ID = '687a2141b6589c8ff21c58ee'; // Change if needed

async function updateOrders() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const result = await Order.updateMany({}, { $set: { seller: SELLER_ID } });
    console.log('Orders updated:', result.modifiedCount);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error updating orders:', err);
    process.exit(1);
  }
}

updateOrders();
