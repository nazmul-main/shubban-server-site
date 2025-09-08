const axios = require('axios');

const completeAdmin = async () => {
  try {
    console.log('🚀 Testing Complete Admin System...\n');

    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin-login', {
      email: 'admin@shubban.com',
      password: 'Admin123!'
    });

    if (loginResponse.data.success) {
      console.log('✅ Admin Login Successful!');
      console.log(`   User: ${loginResponse.data.data.user.name}`);
      console.log(`   Email: ${loginResponse.data.data.user.email}`);
      console.log(`   Role: ${loginResponse.data.data.user.role}`);
      console.log(`   Token: ${loginResponse.data.data.token.substring(0, 20)}...`);
      console.log(`   Device ID: ${loginResponse.data.data.deviceId}`);
    } else {
      console.log('❌ Admin Login Failed!');
      return;
    }

    const token = loginResponse.data.data.token;
    const deviceId = loginResponse.data.data.deviceId;

    // Test 2: Get Admin Devices
    console.log('\n2️⃣ Testing Get Admin Devices...');
    try {
      const devicesResponse = await axios.get('http://localhost:5000/api/auth/admin-devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (devicesResponse.data.success) {
        console.log('✅ Get Devices Successful!');
        console.log(`   Active Devices: ${devicesResponse.data.data.length}`);
        devicesResponse.data.data.forEach((device, index) => {
          console.log(`   Device ${index + 1}: ${device.deviceInfo}`);
        });
      }
    } catch (error) {
      console.log('❌ Get Devices Failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Test Device Limit (Login from another device)
    console.log('\n3️⃣ Testing Device Limit...');
    try {
      const loginResponse2 = await axios.post('http://localhost:5000/api/auth/admin-login', {
        email: 'admin@shubban.com',
        password: 'Admin123!'
      }, {
        headers: {
          'User-Agent': 'Test Device 2'
        }
      });

      if (loginResponse2.data.success) {
        console.log('✅ Second Device Login Successful!');
        console.log(`   New Device ID: ${loginResponse2.data.data.deviceId}`);
      }
    } catch (error) {
      console.log('❌ Second Device Login Failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Test Third Device
    console.log('\n4️⃣ Testing Third Device...');
    try {
      const loginResponse3 = await axios.post('http://localhost:5000/api/auth/admin-login', {
        email: 'admin@shubban.com',
        password: 'Admin123!'
      }, {
        headers: {
          'User-Agent': 'Test Device 3'
        }
      });

      if (loginResponse3.data.success) {
        console.log('✅ Third Device Login Successful!');
        console.log(`   New Device ID: ${loginResponse3.data.data.deviceId}`);
      }
    } catch (error) {
      console.log('❌ Third Device Login Failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Test Fourth Device (Should remove oldest)
    console.log('\n5️⃣ Testing Fourth Device (Should remove oldest)...');
    try {
      const loginResponse4 = await axios.post('http://localhost:5000/api/auth/admin-login', {
        email: 'admin@shubban.com',
        password: 'Admin123!'
      }, {
        headers: {
          'User-Agent': 'Test Device 4'
        }
      });

      if (loginResponse4.data.success) {
        console.log('✅ Fourth Device Login Successful!');
        console.log(`   New Device ID: ${loginResponse4.data.data.deviceId}`);
        console.log('   (Oldest device should be removed)');
      }
    } catch (error) {
      console.log('❌ Fourth Device Login Failed:', error.response?.data?.message || error.message);
    }

    // Test 6: Admin Logout
    console.log('\n6️⃣ Testing Admin Logout...');
    try {
      const logoutResponse = await axios.post('http://localhost:5000/api/auth/admin-signout', {
        deviceId: deviceId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (logoutResponse.data.success) {
        console.log('✅ Admin Logout Successful!');
      }
    } catch (error) {
      console.log('❌ Admin Logout Failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Wait a bit for server to start, then test
setTimeout(() => {
  completeAdmin();
}, 2000);
