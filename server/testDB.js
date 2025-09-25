const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

async function testDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count total orders
    const totalOrders = await Order.countDocuments();
    console.log('📊 Total orders in database:', totalOrders);

    // Count total users
    const totalUsers = await User.countDocuments();
    console.log('👥 Total users in database:', totalUsers);

    // Get sample orders
    const sampleOrders = await Order.find().limit(3).lean();
    console.log('📋 Sample orders:');
    sampleOrders.forEach(order => {
      console.log(`  - Order ${order._id} | Buyer: ${order.buyer} | Total: ${order.total} | Items: ${order.items?.length || 0}`);
    });

    // Get sample users
    const sampleUsers = await User.find().limit(3).select('name email role').lean();
    console.log('👤 Sample users:');
    sampleUsers.forEach(user => {
      console.log(`  - User ${user._id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Database test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testDatabase();