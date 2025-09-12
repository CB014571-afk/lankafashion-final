// updateProductsWithSellerId.js
// Run this script with: node updateProductsWithSellerId.js

const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not set in environment variables.');
  process.exit(1);
}

async function updateProducts() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find all sellers
    const sellers = await User.find({ role: 'seller' });
    const shopNameToSellerId = {};
    sellers.forEach(seller => {
      if (seller.shopName) {
        shopNameToSellerId[seller.shopName.trim()] = seller._id;
      }
    });

    // Update all products with a valid sellerId based on shopName
    const products = await Product.find();
    let updatedCount = 0;
    for (const product of products) {
      const shopName = product.shopName ? product.shopName.trim() : null;
      if (
        shopName &&
        (!product.seller || typeof product.seller !== 'string' || product.seller.length !== 24)
      ) {
        const sellerId = shopNameToSellerId[shopName];
        if (sellerId) {
          product.seller = sellerId;
          await product.save();
          updatedCount++;
        }
      }
    }
    console.log(`Updated ${updatedCount} products with valid sellerId.`);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Error updating products:', err);
    process.exit(1);
  }
}

updateProducts();
