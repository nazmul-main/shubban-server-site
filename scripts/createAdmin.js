const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { connectToDatabase } = require('../config/database');

const createAdmin = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Database connected successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@shubban.com' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      console.log('Password: Admin123!');
      return;
    }

    // Create admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@shubban.com',
      password: 'Admin123!',
      phone: '01700000000',
      role: 'admin',
      isActive: true,
      currentDistrict: 'Dhaka',
      currentThana: 'Dhanmondi',
      currentVillage: 'Dhanmondi',
      currentPostOffice: 'Dhanmondi',
      permanentDistrict: 'Dhaka',
      permanentThana: 'Dhanmondi',
      permanentVillage: 'Dhanmondi',
      permanentPostOffice: 'Dhanmondi'
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create admin
    const admin = new User(adminData);
    await admin.save();

    console.log('Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', 'Admin123!');
    console.log('Role:', admin.role);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
createAdmin();
