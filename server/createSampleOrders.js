// Test script to create sample orders for testing the orders page
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');

async function createSampleOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test user
    let testUser = await User.findOne({ email: { $regex: /test|demo|buyer/i } });
    
    if (!testUser) {
      console.log('🔍 No test user found, creating one...');
      const bcrypt = require('bcryptjs');
      testUser = await User.create({
        name: 'Test Buyer',
        email: 'testbuyer@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'buyer'
      });
      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log('✅ Found existing test user:', testUser.email);
    }

    // Create sample orders with different statuses
    const sampleOrders = [
      {
        buyer: testUser._id,
        items: [
          {
            product: new mongoose.Types.ObjectId(),
            seller: new mongoose.Types.ObjectId(),
            qty: 2,
            price: 2500,
            name: 'Fashion T-Shirt',
            status: 'Delivered'
          },
          {
            product: new mongoose.Types.ObjectId(),
            seller: new mongoose.Types.ObjectId(),
            qty: 1,
            price: 4500,
            name: 'Designer Jeans',
            status: 'Delivered'
          }
        ],
        total: 9500,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          street: '123 Test Street',
          city: 'Colombo',
          postalCode: '00100',
          country: 'Sri Lanka'
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        buyer: testUser._id,
        items: [
          {
            product: new mongoose.Types.ObjectId(),
            seller: new mongoose.Types.ObjectId(),
            qty: 1,
            price: 3500,
            name: 'Casual Shirt',
            status: 'Processing'
          }
        ],
        total: 3500,
        status: 'processing',
        paymentStatus: 'paid',
        shippingAddress: {
          street: '123 Test Street',
          city: 'Colombo',
          postalCode: '00100',
          country: 'Sri Lanka'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        buyer: testUser._id,
        items: [
          {
            product: new mongoose.Types.ObjectId(),
            seller: new mongoose.Types.ObjectId(),
            qty: 1,
            price: 5000,
            name: 'Premium Jacket',
            status: 'Pending'
          }
        ],
        total: 5000,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          street: '123 Test Street',
          city: 'Colombo',
          postalCode: '00100',
          country: 'Sri Lanka'
        },
        createdAt: new Date() // Today
      }
    ];

    // Clear existing orders for this user to avoid duplicates
    await Order.deleteMany({ buyer: testUser._id });
    console.log('🧹 Cleared existing orders for test user');

    // Create new sample orders
    for (const orderData of sampleOrders) {
      const order = await Order.create(orderData);
      console.log(`✅ Created order: ${order._id} - Status: ${order.status} - Total: Rs ${order.total}`);
    }

    console.log('🎉 Sample orders created successfully!');
    console.log(`\n📋 Test user credentials:`);
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: password123`);
    console.log(`\nYou can now log in and view orders at: http://localhost:5174/buyer-orders`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
    process.exit(1);
  }
}

createSampleOrders();