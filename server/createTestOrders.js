// createTestOrders.js - Script to create test orders for best seller functionality
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function createTestOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find existing sellers and products
    const sellers = await User.find({ role: 'seller' }).limit(3);
    const products = await Product.find().limit(5);
    const buyers = await User.find({ role: 'buyer' }).limit(2);

    if (sellers.length === 0) {
      console.log('No sellers found. Please create some seller accounts first.');
      return;
    }

    if (products.length === 0) {
      console.log('No products found. Please create some products first.');
      return;
    }

    if (buyers.length === 0) {
      console.log('No buyers found. Please create some buyer accounts first.');
      return;
    }

    console.log(`Found ${sellers.length} sellers, ${products.length} products, ${buyers.length} buyers`);

    // Create test orders to make seller[0] the best seller
    const bestSeller = sellers[0];
    const regularSeller = sellers.length > 1 ? sellers[1] : sellers[0];
    
    console.log(`Making ${bestSeller.name} (${bestSeller.shopName}) the best seller`);

    // Create 3 orders for the best seller (more items sold)
    for (let i = 0; i < 3; i++) {
      const order = new Order({
        buyer: buyers[0]._id,
        items: [{
          product: products[0]._id,
          seller: bestSeller._id,
          qty: 2 + i, // Different quantities
          price: products[0].price || 1000,
          status: "Done",
          completedAt: new Date()
        }],
        total: (products[0].price || 1000) * (2 + i),
        status: "delivered",
        paymentStatus: "paid"
      });
      
      await order.save();
      console.log(`Created order ${i + 1} for best seller`);
    }

    // Create 1 order for regular seller (fewer items)
    if (sellers.length > 1) {
      const order = new Order({
        buyer: buyers[0]._id,
        items: [{
          product: products[1]._id,
          seller: regularSeller._id,
          qty: 1,
          price: products[1].price || 800,
          status: "Done",
          completedAt: new Date()
        }],
        total: products[1].price || 800,
        status: "delivered",
        paymentStatus: "paid"
      });
      
      await order.save();
      console.log('Created order for regular seller');
    }

    console.log('✅ Test orders created successfully!');
    console.log(`Best seller should be: ${bestSeller.name} (${bestSeller.shopName})`);
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestOrders();