const axios = require('axios');

const SERVER_URL = 'http://localhost:5000';

async function testLogout() {
  try {
    console.log('🧪 Testing Logout Functionality...\n');

    // Test 1: Login first
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${SERVER_URL}/api/auth/login`, {
      email: 'admin@shubban.com',
      password: 'Admin123!'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      console.log('Token received:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    // Test 2: Test general logout
    console.log('\n2️⃣ Testing general logout...');
    const logoutResponse = await axios.post(`${SERVER_URL}/api/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (logoutResponse.data.success) {
      console.log('✅ General logout successful:', logoutResponse.data.message);
    } else {
      console.log('❌ General logout failed:', logoutResponse.data.message);
    }

    // Test 3: Test admin login and logout
    console.log('\n3️⃣ Testing admin login...');
    const adminLoginResponse = await axios.post(`${SERVER_URL}/api/auth/admin-login`, {
      email: 'admin@shubban.com',
      password: 'Admin123!'
    });

    if (adminLoginResponse.data.success) {
      console.log('✅ Admin login successful');
      const adminToken = adminLoginResponse.data.data.token;
      const deviceId = adminLoginResponse.data.data.deviceId;
      console.log('Admin token received:', adminToken.substring(0, 20) + '...');
      console.log('Device ID:', deviceId);

      // Test admin signout
      console.log('\n4️⃣ Testing admin signout...');
      const adminLogoutResponse = await axios.post(`${SERVER_URL}/api/auth/admin-signout`, {
        deviceId: deviceId
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (adminLogoutResponse.data.success) {
        console.log('✅ Admin signout successful:', adminLogoutResponse.data.message);
      } else {
        console.log('❌ Admin signout failed:', adminLogoutResponse.data.message);
      }
    } else {
      console.log('❌ Admin login failed:', adminLoginResponse.data.message);
    }

    console.log('\n🎉 Logout functionality test completed!');

  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }
}

// Run the test
testLogout();
