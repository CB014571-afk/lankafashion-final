// createSupplierUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // adjust path if needed

async function createSupplier() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'supplier@example.com'; // change as needed
    const password = 'securePassword123'; // change as needed

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Supplier already exists with this email');
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const supplier = new User({
      name: 'Supplier User',
      email,
      password: hashedPassword,
      role: 'supplier',
    });

    await supplier.save();
    console.log('Supplier created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (err) {
    console.error('Error creating supplier:', err);
    process.exit(1);
  }
}

createSupplier();
