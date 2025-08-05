const bcrypt = require('bcryptjs');
const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');

// Test user data array with more users
const testUsersData = [
  {
    name: 'আহমেদ আলী',
    email: 'ahmed@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801712345678',
    nationalId: '1234567890123',
    bloodGroup: 'A+',
    currentVillage: 'মধ্যপাড়া',
    currentPostOffice: 'মধ্যপাড়া ডাকঘর',
    currentThana: 'মধ্যপাড়া থানা',
    currentDistrict: 'ঢাকা',
    permanentVillage: 'স্থায়ী গ্রাম',
    permanentPostOffice: 'স্থায়ী ডাকঘর',
    permanentThana: 'স্থায়ী থানা',
    permanentDistrict: 'চট্টগ্রাম',
    isActive: true
  },
  {
    name: 'ফাতেমা বেগম',
    email: 'fatema@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801812345678',
    nationalId: '1234567890124',
    bloodGroup: 'B+',
    currentVillage: 'নতুন পাড়া',
    currentPostOffice: 'নতুন পাড়া ডাকঘর',
    currentThana: 'নতুন পাড়া থানা',
    currentDistrict: 'চট্টগ্রাম',
    permanentVillage: 'পুরাতন গ্রাম',
    permanentPostOffice: 'পুরাতন ডাকঘর',
    permanentThana: 'পুরাতন থানা',
    permanentDistrict: 'সিলেট',
    isActive: true
  },
  {
    name: 'মোহাম্মদ করিম',
    email: 'karim@subban.org',
    password: 'Test123!',
    role: 'moderator',
    phone: '+8801912345678',
    nationalId: '1234567890125',
    bloodGroup: 'O+',
    currentVillage: 'কেন্দ্রীয় পাড়া',
    currentPostOffice: 'কেন্দ্রীয় ডাকঘর',
    currentThana: 'কেন্দ্রীয় থানা',
    currentDistrict: 'সিলেট',
    permanentVillage: 'মূল গ্রাম',
    permanentPostOffice: 'মূল ডাকঘর',
    permanentThana: 'মূল থানা',
    permanentDistrict: 'রাজশাহী',
    isActive: true
  },
  {
    name: 'আয়েশা খাতুন',
    email: 'ayesha@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801612345678',
    nationalId: '1234567890126',
    bloodGroup: 'AB+',
    currentVillage: 'উত্তর পাড়া',
    currentPostOffice: 'উত্তর পাড়া ডাকঘর',
    currentThana: 'উত্তর পাড়া থানা',
    currentDistrict: 'রাজশাহী',
    permanentVillage: 'দক্ষিণ গ্রাম',
    permanentPostOffice: 'দক্ষিণ ডাকঘর',
    permanentThana: 'দক্ষিণ থানা',
    permanentDistrict: 'খুলনা',
    isActive: true
  },
  {
    name: 'রহমান মিয়া',
    email: 'rahman@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801512345678',
    nationalId: '1234567890127',
    bloodGroup: 'A-',
    currentVillage: 'পূর্ব পাড়া',
    currentPostOffice: 'পূর্ব পাড়া ডাকঘর',
    currentThana: 'পূর্ব পাড়া থানা',
    currentDistrict: 'খুলনা',
    permanentVillage: 'পশ্চিম গ্রাম',
    permanentPostOffice: 'পশ্চিম ডাকঘর',
    permanentThana: 'পশ্চিম থানা',
    permanentDistrict: 'বরিশাল',
    isActive: true
  },
  {
    name: 'নাজমা আক্তার',
    email: 'nazma@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801412345678',
    nationalId: '1234567890128',
    bloodGroup: 'B-',
    currentVillage: 'দক্ষিণ পাড়া',
    currentPostOffice: 'দক্ষিণ পাড়া ডাকঘর',
    currentThana: 'দক্ষিণ পাড়া থানা',
    currentDistrict: 'বরিশাল',
    permanentVillage: 'উত্তর গ্রাম',
    permanentPostOffice: 'উত্তর ডাকঘর',
    permanentThana: 'উত্তর থানা',
    permanentDistrict: 'রংপুর',
    isActive: true
  },
  {
    name: 'ইব্রাহিম হোসেন',
    email: 'ibrahim@subban.org',
    password: 'Test123!',
    role: 'moderator',
    phone: '+8801312345678',
    nationalId: '1234567890129',
    bloodGroup: 'O-',
    currentVillage: 'পশ্চিম পাড়া',
    currentPostOffice: 'পশ্চিম পাড়া ডাকঘর',
    currentThana: 'পশ্চিম পাড়া থানা',
    currentDistrict: 'রংপুর',
    permanentVillage: 'পূর্ব গ্রাম',
    permanentPostOffice: 'পূর্ব ডাকঘর',
    permanentThana: 'পূর্ব থানা',
    permanentDistrict: 'ময়মনসিংহ',
    isActive: true
  },
  {
    name: 'সাবরিনা ইয়াসমিন',
    email: 'sabrina@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801212345678',
    nationalId: '1234567890130',
    bloodGroup: 'AB-',
    currentVillage: 'মধ্য পাড়া',
    currentPostOffice: 'মধ্য পাড়া ডাকঘর',
    currentThana: 'মধ্য পাড়া থানা',
    currentDistrict: 'ময়মনসিংহ',
    permanentVillage: 'বাইরের গ্রাম',
    permanentPostOffice: 'বাইরের ডাকঘর',
    permanentThana: 'বাইরের থানা',
    permanentDistrict: 'কুমিল্লা',
    isActive: true
  },
  {
    name: 'জাহিদ হাসান',
    email: 'jahid@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801112345678',
    nationalId: '1234567890131',
    bloodGroup: 'A+',
    currentVillage: 'ভিতরের পাড়া',
    currentPostOffice: 'ভিতরের পাড়া ডাকঘর',
    currentThana: 'ভিতরের পাড়া থানা',
    currentDistrict: 'কুমিল্লা',
    permanentVillage: 'দূরের গ্রাম',
    permanentPostOffice: 'দূরের ডাকঘর',
    permanentThana: 'দূরের থানা',
    permanentDistrict: 'নোয়াখালী',
    isActive: true
  },
  {
    name: 'রেহানা বেগম',
    email: 'rehana@subban.org',
    password: 'Test123!',
    role: 'user',
    phone: '+8801012345678',
    nationalId: '1234567890132',
    bloodGroup: 'B+',
    currentVillage: 'কাছের পাড়া',
    currentPostOffice: 'কাছের পাড়া ডাকঘর',
    currentThana: 'কাছের পাড়া থানা',
    currentDistrict: 'নোয়াখালী',
    permanentVillage: 'নিকটবর্তী গ্রাম',
    permanentPostOffice: 'নিকটবর্তী ডাকঘর',
    permanentThana: 'নিকটবর্তী থানা',
    permanentDistrict: 'ফরিদপুর',
    isActive: true
  }
];

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function addTestUsers() {
  try {
    console.log('🔗 Connecting to database...');
    await connectToDatabase();
    
    console.log('👥 Starting test user creation process...\n');
    
    const createdUsers = [];
    const existingUsers = [];
    
    for (const userData of testUsersData) {
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
        
        console.log(`✅ Created user: ${userData.name} (${userData.email}) - ${userData.role}`);
        
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
        console.log(`   ${user.role.toUpperCase()}:`);
        console.log(`     Name: ${user.name}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Password: Test123!`);
        console.log('');
      });
    }
    
    // Get total user count
    const totalUsers = await User.countDocuments();
    console.log(`📈 Total users in database: ${totalUsers}`);
    
    console.log('\n⚠️  Please change passwords after first login!');
    
  } catch (error) {
    console.error('❌ Error in test user creation process:', error.message);
  } finally {
    await disconnectFromDatabase();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the function
addTestUsers(); 