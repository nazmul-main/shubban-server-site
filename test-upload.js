const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUserCreation() {
  try {
    console.log('🧪 Testing user creation with photo...');
    
    // Create FormData
    const formData = new FormData();
    
    // Add text fields
    formData.append('fullName', 'Test User');
    formData.append('email', `test${Date.now()}@test.com`);
    formData.append('password', '123456');
    formData.append('userRole', 'user');
    formData.append('mobileNumber', '1234567890');
    
    // Add a test image (create a simple 1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('photo', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Sending request...');
    
    const response = await axios.post('http://localhost:5000/api/users', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

async function testBasicUserCreation() {
  try {
    console.log('🧪 Testing basic user creation...');
    
    const response = await axios.post('http://localhost:5000/api/users/test', {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: '123456'
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting tests...');
  
  // Test basic user creation first
  await testBasicUserCreation();
  
  // Test user creation with photo
  await testUserCreation();
  
  console.log('🏁 Tests completed');
}

runTests(); 