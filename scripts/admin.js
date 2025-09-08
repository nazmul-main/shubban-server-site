const mongoose = require('mongoose');
const User = require('../models/User');
const { connectToDatabase } = require('../config/database');

const admin = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Database connected successfully');

    // Check all admin users
    const admins = await User.find({ role: 'admin' }).select('name email role isActive createdAt');
    
    console.log('\n=== Admin Users in Database ===');
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin User:`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Created: ${admin.createdAt}`);
      });
    }

    // Check specific admin
    const specificAdmin = await User.findOne({ email: 'admin@shubban.com' });
    if (specificAdmin) {
      console.log('\n=== Specific Admin Details ===');
      console.log('✅ Admin found!');
      console.log(`Name: ${specificAdmin.name}`);
      console.log(`Email: ${specificAdmin.email}`);
      console.log(`Role: ${specificAdmin.role}`);
      console.log(`Active: ${specificAdmin.isActive}`);
      console.log(`Password Hash: ${specificAdmin.password ? 'Set' : 'Not Set'}`);
    } else {
      console.log('\n❌ Specific admin (admin@shubban.com) not found!');
    }

  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
admin();
