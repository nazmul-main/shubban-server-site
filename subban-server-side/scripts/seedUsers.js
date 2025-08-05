const bcrypt = require('bcryptjs');
const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

// User data array
const usersData = [
  {
    name: 'Admin User',
    email: 'admin@subban.org',
    password: 'Admin123!',
    role: 'admin',
    phone: '+8801234567890',
    address: 'Dhaka, Bangladesh',
    isActive: true
  },
  {
    name: 'Moderator User',
    email: 'moderator@subban.org',
    password: 'Moderator123!',
    role: 'moderator',
    phone: '+8801234567891',
    address: 'Chittagong, Bangladesh',
    isActive: true
  },
  {
    name: 'Regular User',
    email: 'user@subban.org',
    password: 'User123!',
    role: 'user',
    phone: '+8801234567892',
    address: 'Sylhet, Bangladesh',
    isActive: true
  },
  {
    name: 'Test Admin',
    email: 'testadmin@subban.org',
    password: 'TestAdmin123!',
    role: 'admin',
    phone: '+8801234567893',
    address: 'Rajshahi, Bangladesh',
    isActive: true
  }
];

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function createUsers() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDatabase();
    
    console.log('👥 Starting user creation process...\n');
    
    const createdUsers = [];
    const existingUsers = [];
    
    for (const userData of usersData) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          existingUsers.push(existingUser);
          console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
          continue;
        }
        
        // Hash password
        const hashedPassword = await hashPassword(userData.password);
        
        // Create user
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save();
        createdUsers.push(user);
        
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${createdUsers.length} users`);
    console.log(`⚠️  Already existed: ${existingUsers.length} users`);
    
    if (createdUsers.length > 0) {
      console.log('\n🔑 New User Credentials:');
      createdUsers.forEach(user => {
        const originalData = usersData.find(u => u.email === user.email);
        console.log(`   ${user.role.toUpperCase()}:`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Password: ${originalData.password}`);
        console.log('');
      });
    }
    
    if (existingUsers.length > 0) {
      console.log('📋 Existing Users:');
      existingUsers.forEach(user => {
        console.log(`   ${user.email} (${user.role}) - Created: ${user.createdAt.toLocaleDateString()}`);
      });
    }
    
    console.log('\n⚠️  Please change passwords after first login!');
    
  } catch (error) {
    console.error('❌ Error in user creation process:', error.message);
  } finally {
    await disconnectFromDatabase();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed function
createUsers(); 