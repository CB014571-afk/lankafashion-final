// Test script to check existing orders and add sample data with UK sizes and special requests
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not set in environment variables.');
  process.exit(1);
}

async function testOrdersWithNewFields() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Check existing orders
    const existingOrders = await Order.find().populate('buyer', 'name email');
    console.log(`\n📋 Found ${existingOrders.length} existing orders`);

    if (existingOrders.length > 0) {
      console.log('\n🔍 Sample of existing orders:');
      existingOrders.slice(0, 3).forEach(order => {
        console.log(`\nOrder ${order._id}:`);
        console.log(`  Buyer: ${order.buyer?.name} (${order.buyer?.email})`);
        console.log(`  Items: ${order.items?.length}`);
        order.items?.slice(0, 2).forEach((item, idx) => {
          console.log(`    Item ${idx + 1}: qty=${item.qty}, ukSize=${item.ukSize || 'not set'}, specialRequest=${item.specialRequest || 'not set'}`);
        });
      });
    }

    // Find a buyer and seller for test
    const buyer = await User.findOne({ role: 'buyer' });
    const seller = await User.findOne({ role: 'seller' });
    const product = await Product.findOne();

    if (buyer && seller && product) {
      console.log('\n🧪 Creating test order with UK size and special request...');
      
      const testOrder = new Order({
        buyer: buyer._id,
        items: [{
          product: product._id,
          seller: seller._id,
          qty: 2,
          price: 1500,
          ukSize: 'UK 8',
          specialRequest: 'Please pack carefully - gift for someone special'
        }],
        total: 3000,
        paymentStatus: 'paid',
        status: 'confirmed',
        shippingAddress: {
          name: 'Test Customer',
          address: '123 Test Street, Colombo',
          email: 'test@example.com',
          phone: '+94712345678'
        }
      });

      await testOrder.save();
      console.log(`✅ Test order created: ${testOrder._id}`);
      
      // Retrieve and display the test order
      const savedOrder = await Order.findById(testOrder._id)
        .populate('buyer', 'name email')
        .populate('items.product', 'name price');
        
      console.log('\n📦 Test order details:');
      console.log(`  Buyer: ${savedOrder.buyer.name}`);
      console.log(`  Items:`);
      savedOrder.items.forEach((item, idx) => {
        console.log(`    ${idx + 1}. ${item.product?.name} - Qty: ${item.qty}`);
        console.log(`       UK Size: ${item.ukSize || 'not specified'}`);
        console.log(`       Special Request: ${item.specialRequest || 'none'}`);
      });
    } else {
      console.log('⚠️ Could not find buyer, seller, or product for test order');
    }

    await mongoose.disconnect();
    console.log('\n✅ Test completed and disconnected from MongoDB');

  } catch (err) {
    console.error('❌ Error testing orders:', err);
    process.exit(1);
  }
}

testOrdersWithNewFields();