const { JWT_SECRET } = require('./config/constants');
const jwt = require('jsonwebtoken');

console.log('🔑 JWT_SECRET from constants:', JWT_SECRET);
console.log('🔑 JWT_SECRET length:', JWT_SECRET.length);

// Test token creation and verification
const testPayload = { userId: 'test123' };
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });

console.log('🔐 Test token created:', token.substring(0, 50) + '...');

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verification successful:', decoded);
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test with environment variable directly
const envSecret = process.env.JWT_SECRET;
console.log('🔑 JWT_SECRET from env:', envSecret);
console.log('🔑 Env secret length:', envSecret ? envSecret.length : 0);

if (envSecret && envSecret !== JWT_SECRET) {
  console.log('⚠️  WARNING: JWT_SECRET mismatch between env and constants!');
} else {
  console.log('✅ JWT_SECRET is consistent');
}
