const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

// New admin name
const newAdminName = 'সুব্বান অ্যাডমিন'; // You can change this to any name you want

async function updateAdminName() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDatabase();
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@subban.org' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('👤 Current admin user:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    
    // Update the name
    adminUser.name = newAdminName;
    await adminUser.save();
    
    console.log('✅ Admin user name updated successfully!');
    console.log('👤 New name:', adminUser.name);
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Role:', adminUser.role);
    
  } catch (error) {
    console.error('❌ Error updating admin user name:', error.message);
  } finally {
    await disconnectFromDatabase();
    console.log('🔌 Database connection closed');
  }
}

// Run the update function
updateAdminName(); 