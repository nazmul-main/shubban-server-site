const bcrypt = require('bcryptjs');
const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

async function createTestUser() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDatabase();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const name = args[0];
    const email = args[1];
    const password = args[2] || 'Test123!';
    const role = args[3] || 'user';
    
    if (!name || !email) {
      console.log('❌ Usage: node createTestUser.js <name> <email> [password] [role]');
      console.log('   Example: node createTestUser.js "Test User" "test@example.com" "password123" "admin"');
      process.exit(1);
    }
    
    console.log('👤 Creating test user...');
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️  User already exists: ${email}`);
      console.log(`   Current role: ${existingUser.role}`);
      console.log(`   Created: ${existingUser.createdAt.toLocaleDateString()}`);
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone: '+8801234567890',
      currentDistrict: 'Dhaka',
      isActive: true
    });
    
    await user.save();
    
    console.log('✅ User created successfully!');
    console.log(`   ID: ${user._id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createTestUser();
