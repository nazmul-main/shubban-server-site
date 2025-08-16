const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/subban', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    // Count all users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    // Get all users with details
    const allUsers = await User.find().select('name email role isActive createdAt');
    console.log('\n👥 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Count by role
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const moderatorUsers = await User.countDocuments({ role: 'moderator' });
    
    console.log('📈 User breakdown by role:');
    console.log(`   Admin: ${adminUsers}`);
    console.log(`   User: ${regularUsers}`);
    console.log(`   Moderator: ${moderatorUsers}`);
    
    // Count by active status
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    console.log('\n📈 User breakdown by status:');
    console.log(`   Active: ${activeUsers}`);
    console.log(`   Inactive: ${inactiveUsers}`);
    
    // Check for any users created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    console.log(`\n📅 Users created in last 7 days: ${recentUsers}`);
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the check
checkUsers(); 