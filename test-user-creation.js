const axios = require('axios');

async function testAdminUserCreation() {
  try {
    console.log('🔐 Testing Admin User Creation...');
    
    // 1. Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@shubban.org',
      password: 'admin123'
    });
    
    const { token } = loginResponse.data.data;
    console.log('✅ Login successful, token received');
    
    // 2. Create a new user
    const createUserResponse = await axios.post('http://localhost:5000/api/users', {
      name: 'Test User',
      email: 'test4@example.com',
      password: 'test123',
      role: 'user',
      phone: '+8801234567890'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User created successfully:', createUserResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

// Run the test
testAdminUserCreation();
