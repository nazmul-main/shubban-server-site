const bcrypt = require('bcryptjs');
const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

// New Admin user data
const newAdminData = {
  name: 'Super Admin',
  email: 'superadmin@subban.org',
  password: 'superadmin123',
  role: 'admin',
  phone: '+8801234567891',
  address: 'Dhaka, Bangladesh',
  isActive: true
};

async function createNewAdmin() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDatabase();
    
    // Check if new admin already exists
    const existingAdmin = await User.findOne({ email: newAdminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  New admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('📅 Created:', existingAdmin.createdAt);
      return;
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newAdminData.password, saltRounds);
    
    // Create new admin user
    console.log('👤 Creating new admin user...');
    const newAdminUser = new User({
      ...newAdminData,
      password: hashedPassword
    });
    
    await newAdminUser.save();
    
    console.log('✅ New admin user created successfully!');
    console.log('📧 Email:', newAdminUser.email);
    console.log('👤 Role:', newAdminUser.role);
    console.log('📅 Created:', newAdminUser.createdAt);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('   Email: superadmin@subban.org');
    console.log('   Password: superadmin123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating new admin user:', error.message);
    if (error.code === 11000) {
      console.log('⚠️  Admin user already exists with this email!');
    }
  } finally {
    await disconnectFromDatabase();
    console.log('🔌 Database connection closed');
  }
}

// Run the function
createNewAdmin();
