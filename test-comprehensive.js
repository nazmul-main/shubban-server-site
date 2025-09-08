const axios = require('axios');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = require('./config/constants');

async function testComprehensive() {
  try {
    console.log('🔐 Comprehensive Authentication Test...');
    console.log('🔑 JWT_SECRET from constants:', JWT_SECRET);
    
    // 1. Login as admin
    console.log('\n1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const { token, user } = loginResponse.data.data;
    console.log('✅ Login successful');
    console.log('👤 User data:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    console.log('🔐 Token received (first 50 chars):', token.substring(0, 50) + '...');
    
    // 2. Verify token manually
    console.log('\n2️⃣ Verifying token manually...');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Manual token verification successful:', decoded);
    } catch (error) {
      console.log('❌ Manual token verification failed:', error.message);
      return;
    }
    
    // 3. Test /api/auth/me endpoint (should work)
    console.log('\n3️⃣ Testing /api/auth/me endpoint...');
    try {
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ /me endpoint successful:', meResponse.data.data);
    } catch (error) {
      console.log('❌ /me endpoint failed:', error.response?.data || error.message);
    }
    
    // 4. Test user creation endpoint
    console.log('\n4️⃣ Testing user creation endpoint...');
    try {
      const createUserResponse = await axios.post('http://localhost:5000/api/users', {
        name: 'Test User',
        email: 'test5@example.com',
        password: 'test123',
        role: 'user',
        phone: '+8801234567890'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ User creation successful:', createUserResponse.data);
    } catch (error) {
      console.log('❌ User creation failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testComprehensive();
