
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/modules/user/user.model');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminEmail = 'admin@farm2table.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    const admin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      phone: '9999999999',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@farm2table.com');
    console.log('Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();