// src/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); 
const connectDB = require('../config/database');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@smarttiffin.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists!');
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@mail.com',
      password: 'Admin123',
      role: 'admin'
    });

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
