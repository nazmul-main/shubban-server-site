const bcrypt = require('bcryptjs');
const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@subban.org',
  password: 'Admin123!',
  role: 'admin',
  phone: '+8801234567890',
  address: 'Dhaka, Bangladesh',
  isActive: true
};

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('📅 Created:', existingAdmin.createdAt);
      return;
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      ...adminData,
      password: hashedPassword
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Role:', adminUser.role);
    console.log('📅 Created:', adminUser.createdAt);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('   Email: admin@subban.org');
    console.log('   Password: Admin123!');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.log('⚠️  Admin user already exists with this email!');
    }
  } finally {
    await disconnectFromDatabase();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
createAdminUser(); 