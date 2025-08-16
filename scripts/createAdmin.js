const bcrypt = require('bcryptjs');
const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

// Admin seed data
const adminSeed = {
  name: 'Admin',
  email: 'admin@subban.org',
  password: 'admin123',
  role: 'admin',
  phone: '+8801234567890',
  address: 'Dhaka, Bangladesh',
  isActive: true
};

async function createAdmin() {
  try {
    console.log('🔗 Database connection...');
    await connectToDatabase();
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminSeed.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminSeed.password, 12);
    
    // Create admin
    const admin = new User({
      ...adminSeed,
      password: hashedPassword
    });
    
    await admin.save();
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminSeed.password);
    console.log('👤 Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await disconnectFromDatabase();
  }
}

createAdmin(); 