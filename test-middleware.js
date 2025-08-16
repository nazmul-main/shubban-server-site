const { protect, authorize } = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/constants');

console.log('🔑 JWT_SECRET:', JWT_SECRET);

// Test the authorize function directly
const testAuthorize = authorize(['admin']);
console.log('✅ authorize function created');

// Test with mock request
const mockReq = {
  user: {
    _id: 'test123',
    email: 'admin@test.com',
    role: 'admin'
  }
};

const mockRes = {};
const mockNext = (error) => {
  if (error) {
    console.log('❌ Next called with error:', error.message);
  } else {
    console.log('✅ Next called successfully');
  }
};

console.log('\n🧪 Testing authorize middleware...');
console.log('Mock user:', mockReq.user);
testAuthorize(mockReq, mockRes, mockNext);

// Test with non-admin user
const mockReq2 = {
  user: {
    _id: 'test456',
    email: 'user@test.com',
    role: 'user'
  }
};

console.log('\n🧪 Testing authorize middleware with non-admin user...');
console.log('Mock user:', mockReq2.user);
testAuthorize(mockReq2, mockRes, mockNext);
