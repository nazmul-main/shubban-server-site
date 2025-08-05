require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('🔍 Testing Cloudinary configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

console.log('\n🔧 Cloudinary Config:');
console.log('Cloud Name:', cloudinary.config().cloud_name);
console.log('API Key:', cloudinary.config().api_key ? '✅ Set' : '❌ Missing');
console.log('API Secret:', cloudinary.config().api_secret ? '✅ Set' : '❌ Missing');

// Test Cloudinary connection
console.log('\n🧪 Testing Cloudinary connection...');

cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
  })
  .catch(error => {
    console.error('❌ Cloudinary connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid credentials')) {
      console.error('\n💡 Solution: Check your Cloudinary credentials in .env file');
    } else if (error.message.includes('cloud_name')) {
      console.error('\n💡 Solution: Set CLOUDINARY_CLOUD_NAME in .env file');
    } else if (error.message.includes('api_key')) {
      console.error('\n💡 Solution: Set CLOUDINARY_API_KEY in .env file');
    } else if (error.message.includes('api_secret')) {
      console.error('\n💡 Solution: Set CLOUDINARY_API_SECRET in .env file');
    }
  }); 