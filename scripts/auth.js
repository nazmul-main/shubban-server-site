const axios = require('axios');
const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const User = require('../models/User');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/constants');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_CREDENTIALS = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD
};

async function authentication() {
  try {
    console.log('🧪 Testing Authentication System...\n');
    
    // Test 1: Login with admin credentials
    console.log('1️⃣ Testing Admin Login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
      
      if (loginResponse.data.success) {
        console.log('✅ Admin login successful!');
        console.log('👤 User:', loginResponse.data.data.user.name);
        console.log('🔑 Role:', loginResponse.data.data.user.role);
        console.log('🎫 Token received');
        
        const token = loginResponse.data.data.token;
        
        // Test 2: Get current user profile (protected route)
        console.log('\n2️⃣ Testing Protected Route Access...');
        try {
          const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (profileResponse.data.success) {
            console.log('✅ Protected route access successful!');
            console.log('👤 Profile retrieved:', profileResponse.data.data.name);
          }
          
        } catch (error) {
          console.log('❌ Protected route access failed:', error.response?.data?.message || error.message);
        }
        
        // Test 3: Test admin-only route
        console.log('\n3️⃣ Testing Admin-Only Route...');
        try {
          const usersResponse = await axios.get(`${BASE_URL}/users`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (usersResponse.data.success) {
            console.log('✅ Admin route access successful!');
            console.log('👥 Users count:', usersResponse.data.data.length);
          }
          
        } catch (error) {
          console.log('❌ Admin route access failed:', error.response?.data?.message || error.message);
        }
        
      } else {
        console.log('❌ Admin login failed:', loginResponse.data.message);
      }
      
    } catch (error) {
      console.log('❌ Login request failed:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Test invalid credentials
    console.log('\n4️⃣ Testing Invalid Credentials...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@subban.org',
        password: 'WrongPassword123!'
      });
      console.log('❌ Invalid login should have failed!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected!');
      } else {
        console.log('❌ Unexpected error with invalid credentials:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 5: Test without token
    console.log('\n5️⃣ Testing Access Without Token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.log('❌ Access without token should have failed!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Access without token properly rejected!');
      } else {
        console.log('❌ Unexpected error without token:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running
async function checkServerStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.success) {
      console.log('✅ Server is running and healthy!');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Please start the server with: npm run dev');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    return;
  }
  
  await authentication();
  
  console.log('\n🎉 Authentication tests completed!');
}

main(); 