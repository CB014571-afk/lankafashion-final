require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function removeInvalidProducts() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Product.deleteMany({ name: { $exists: false } });
  console.log(`Removed ${result.deletedCount} products without a name.`);
  await mongoose.disconnect();
}

removeInvalidProducts();
