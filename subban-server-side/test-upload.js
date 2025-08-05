const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a test image (1x1 pixel PNG)
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

// Write test image to file
const testImagePath = path.join(__dirname, 'test-image.png');
fs.writeFileSync(testImagePath, testImageData);

console.log('🧪 Testing upload functionality...\n');

// Create form data
const formData = new FormData();
formData.append('image', fs.createReadStream(testImagePath));

// Test upload
const testUpload = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/upload/single', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this with a valid token
      },
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload test successful!');
      console.log('Response:', data);
    } else {
      console.log('❌ Upload test failed:');
      console.log('Status:', response.status);
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('❌ Upload test error:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
};

// Note: This test requires a valid authentication token
console.log('⚠️  Note: This test requires a valid authentication token');
console.log('   Replace YOUR_TOKEN_HERE with a valid admin token');
console.log('   You can get a token by logging in to the admin panel\n');

// Uncomment the line below to run the test
// testUpload(); 