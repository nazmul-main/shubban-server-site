const cloudinary = require('cloudinary').v2;

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary configuration missing:');
    console.error('   CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
    console.error('   CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
    console.error('   CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
    console.error('   Please check your .env file and ensure all Cloudinary credentials are set.');
    return false;
  }

  console.log('✅ Cloudinary configuration validated');
  return true;
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate on module load
validateCloudinaryConfig();

module.exports = cloudinary; 