const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

// Function to promote user to admin
async function promoteToAdmin(email) {
  try {
    console.log('🔗 Database connection...');
    await connectToDatabase();
    
    // Find user by email
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    if (user.role === 'admin') {
      console.log('⚠️  User is already admin:', email);
      return;
    }
    
    // Update role to admin
    user.role = 'admin';
    await user.save();
    
    console.log('✅ User promoted to admin successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 New Role:', user.role);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await disconnectFromDatabase();
  }
}

// Function to list all users
async function listUsers() {
  try {
    console.log('🔗 Database connection...');
    await connectToDatabase();
    
    const users = await User.find().select('name email role createdAt');
    
    console.log('👥 All Users:');
    console.log('─'.repeat(60));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await disconnectFromDatabase();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'list') {
  listUsers();
} else if (command === 'promote' && args[1]) {
  promoteToAdmin(args[1]);
} else {
  console.log('Usage:');
  console.log('  node scripts/promoteToAdmin.js list                    - List all users');
  console.log('  node scripts/promoteToAdmin.js promote user@email.com  - Promote user to admin');
} 