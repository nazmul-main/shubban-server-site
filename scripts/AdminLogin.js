const axios = require('axios');

const adminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/admin-login', {
      email: 'admin@shubban.com',
      password: 'Admin123!'
    });

    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Login failed!');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
};

// Wait a bit for server to start, then test
setTimeout(() => {
  adminLogin();
}, 3000);
