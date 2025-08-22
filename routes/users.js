const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const { successResponse } = require('../utils/response');
const { validatePassword } = require('../utils/validation');
const User = require('../models/User');
const { uploadSingle } = require('../middleware/upload');
const { uploadImage } = require('../utils/upload');
const router = express.Router();

// Simple test endpoint (no auth required)
router.get('/test-connection', (req, res) => {
  try {
    console.log('🧪 Test connection endpoint called');
    res.json({
      success: true,
      message: 'Users route is working',
      timestamp: new Date().toISOString(),
      databaseStatus: User.db.readyState
    });
  } catch (error) {
    console.error('❌ Test connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Test connection failed',
      error: error.message
    });
  }
});

// Public test endpoint for Cloudinary (no auth required)
router.get('/test-cloudinary-public', async (req, res) => {
  try {
    console.log('🧪 Testing Cloudinary connection (public endpoint)...');
    
    // Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log('🔍 Cloudinary environment variables:');
    console.log('  CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
    console.log('  CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
    console.log('  CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
    
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration missing',
        errors: { 
          cloudinary: 'Please check your .env file and ensure all Cloudinary credentials are set' 
        }
      });
    }
    
    // Test Cloudinary connection by trying to get account info
    const cloudinary = require('../config/cloudinary');
    const result = await cloudinary.api.ping();
    
    console.log('✅ Cloudinary connection test successful:', result);
    
    return res.json({
      success: true,
      message: 'Cloudinary connection successful',
      data: {
        cloudName,
        apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : null,
        apiSecret: apiSecret ? `${apiSecret.substring(0, 4)}...` : null,
        pingResult: result
      }
    });
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Cloudinary connection test failed',
      errors: { cloudinary: error.message }
    });
  }
});

// Public test endpoint for user creation (no auth required)
router.post('/test-public', async (req, res) => {
  try {
    console.log('🧪 Test user creation request (public endpoint):', req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: { missing: 'Name, email, and password are required' }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        errors: { email: 'User already exists with this email' }
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create test user
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: 'user'
    };
    
    console.log('🧪 Creating test user with data:', userData);
    
    const user = new User(userData);
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(201).json({
      success: true,
      message: 'Test user creation successful (public endpoint)',
      data: userResponse
    });
  } catch (error) {
    console.error('❌ Test user creation error (public endpoint):', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.errors) {
      console.error('❌ Validation errors:', error.errors);
      Object.keys(error.errors).forEach(key => {
        console.error(`❌ Field ${key}:`, error.errors[key]);
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Test user creation failed (public endpoint)',
      errors: { general: error.message }
    });
  }
});

// Get all users (admin only)
router.get('/', protect, authorize(['admin']), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    select: '-password'
  };

  const users = await User.paginate(query, options);
  
  return successResponse(res, users, 'Users retrieved successfully');
}));

// Get user by ID
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Only admins can view other users' details
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this user'
    });
  }

  return successResponse(res, user, 'User retrieved successfully');
}));

// Test endpoint for user creation without photo
router.post('/test', async (req, res) => {
  try {
    console.log('🧪 Test user creation request:', req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: { missing: 'Name, email, and password are required' }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        errors: { email: 'User already exists with this email' }
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create test user
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: 'user'
    };
    
    console.log('🧪 Creating test user with data:', userData);
    
    const user = new User(userData);
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(201).json({
      success: true,
      message: 'Test user creation successful',
      data: userResponse
    });
  } catch (error) {
    console.error('❌ Test user creation error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.errors) {
      console.error('❌ Validation errors:', error.errors);
      Object.keys(error.errors).forEach(key => {
        console.error(`❌ Field ${key}:`, error.errors[key]);
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Test user creation failed',
      errors: { general: error.message }
    });
  }
});

// Test Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    
    // Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log('🔍 Cloudinary environment variables:');
    console.log('  CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
    console.log('  CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
    console.log('  CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
    
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration missing',
        errors: { 
          cloudinary: 'Please check your .env file and ensure all Cloudinary credentials are set' 
        }
      });
    }
    
    // Test Cloudinary connection by trying to get account info
    const cloudinary = require('../config/cloudinary');
    const result = await cloudinary.api.ping();
    
    console.log('✅ Cloudinary connection test successful:', result);
    
    return res.json({
      success: true,
      message: 'Cloudinary connection successful',
      data: {
        cloudName,
        apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : null,
        apiSecret: apiSecret ? `${apiSecret.substring(0, 4)}...` : null,
        pingResult: result
      }
    });
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Cloudinary connection test failed',
      errors: { cloudinary: error.message }
    });
  }
});

// Create new user (no auth required) - with photo upload
router.post('/', uploadSingle, async (req, res) => {
  try {
    console.log('📥 Received user creation request');
    console.log('📋 Request body:', req.body);
    console.log('📸 Request file:', req.file);
    
    // Check database connection
    if (!User.db.readyState) {
      console.error('❌ Database not connected');
      return res.status(500).json({
        success: false,
        message: 'Database connection error',
        errors: { database: 'Database is not connected' }
      });
    }
    
    console.log('✅ Database connection status:', User.db.readyState);
    
    // Check if required fields are present
    const requiredFields = ['fullName', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    console.log('🔍 Required fields check:', {
      fullName: req.body.fullName ? '✅ Present' : '❌ Missing',
      email: req.body.email ? '✅ Present' : '❌ Missing',
      password: req.body.password ? '✅ Present' : '❌ Missing'
    });
    
    console.log('🔍 All received fields:', Object.keys(req.body));
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: { 
          missing: `Required fields missing: ${missingFields.join(', ')}` 
        }
      });
    }
    
    // Extract and map fields from the client form
    const {
      fullName,           // Client sends 'fullName'
      email,
      password,
      userRole,           // Client sends 'userRole'
      mobileNumber,       // Client sends 'mobileNumber'
      formNumber,
      memberNumber,
      applicationDate,
      motherName,
      fatherName,
      birthDate,
      age,
      nationalId,
      currentVillage,
      currentPostOffice,
      currentThana,
      currentDistrict,
      permanentVillage,
      permanentPostOffice,
      permanentThana,
      permanentDistrict,
      bloodGroup,
      ...otherFields
    } = req.body;

    // Fix duplicated fields by taking first value from arrays
    const cleanField = (value) => {
      if (Array.isArray(value)) {
        return value[0]; // Take first value if it's an array
      }
      return value;
    };

    // Clean all fields to remove duplication
    const cleanFullName = cleanField(fullName);
    const cleanEmail = cleanField(email);
    const cleanPassword = cleanField(password);
    const cleanUserRole = cleanField(userRole);
    const cleanMobileNumber = cleanField(mobileNumber);
    const cleanFormNumber = cleanField(formNumber);
    const cleanMemberNumber = cleanField(memberNumber);
    const cleanApplicationDate = cleanField(applicationDate);
    const cleanMotherName = cleanField(motherName);
    const cleanFatherName = cleanField(fatherName);
    const cleanBirthDate = cleanField(birthDate);
    const cleanAge = cleanField(age);
    const cleanNationalId = cleanField(nationalId);
    const cleanCurrentVillage = cleanField(currentVillage);
    const cleanCurrentPostOffice = cleanField(currentPostOffice);
    const cleanCurrentThana = cleanField(currentThana);
    const cleanCurrentDistrict = cleanField(currentDistrict);
    const cleanPermanentVillage = cleanField(permanentVillage);
    const cleanPermanentPostOffice = cleanField(permanentPostOffice);
    const cleanPermanentThana = cleanField(permanentThana);
    const cleanPermanentDistrict = cleanField(permanentDistrict);
    const cleanBloodGroup = cleanField(bloodGroup);

    // Log the extracted fields
    console.log('🔍 Extracted fields:', { 
      fullName: cleanFullName, 
      email: cleanEmail, 
      password: cleanPassword, 
      userRole: cleanUserRole, 
      mobileNumber: cleanMobileNumber, 
      formNumber: cleanFormNumber, 
      memberNumber: cleanMemberNumber, 
      applicationDate: cleanApplicationDate, 
      motherName: cleanMotherName, 
      fatherName: cleanFatherName, 
      birthDate: cleanBirthDate, 
      age: cleanAge, 
      nationalId: cleanNationalId,
      currentVillage: cleanCurrentVillage, 
      currentPostOffice: cleanCurrentPostOffice, 
      currentThana: cleanCurrentThana, 
      currentDistrict: cleanCurrentDistrict,
      permanentVillage: cleanPermanentVillage, 
      permanentPostOffice: cleanPermanentPostOffice, 
      permanentThana: cleanPermanentThana, 
      permanentDistrict: cleanPermanentDistrict,
      bloodGroup: cleanBloodGroup, 
      otherFields 
    });

    // Debug: Show cleaned values
    console.log('🔧 Cleaned field values:', {
      fullName: cleanFullName,
      email: cleanEmail,
      password: cleanPassword ? `${cleanPassword.substring(0, 3)}...` : 'empty',
      userRole: cleanUserRole,
      mobileNumber: cleanMobileNumber
    });

    // Debug: Show role mapping
    const mapUserRole = (inputRole) => {
      const roleMap = {
        'general': 'user',
        'member': 'user',
        'regular': 'user',
        'basic': 'user',
        'standard': 'user',
        'normal': 'user'
      };
      
      // If it's a mapped role, use the mapped value
      if (roleMap[inputRole]) {
        return roleMap[inputRole];
      }
      
      // If it's already a valid role, use it
      if (['user', 'admin', 'moderator'].includes(inputRole)) {
        return inputRole;
      }
      
      // Default to 'user' for any unrecognized role
      return 'user';
    };

    const finalRole = mapUserRole(cleanUserRole);
    console.log('🎭 Enhanced role mapping:', {
      originalRole: cleanUserRole,
      finalRole: finalRole,
      validRoles: ['user', 'admin', 'moderator']
    });

    // Log the exact request body for debugging
    console.log('🔍 Raw request body:', JSON.stringify(req.body, null, 2));

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      console.log('❌ User already exists with email:', cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        errors: { email: 'User already exists with this email' }
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(cleanPassword);
    if (!passwordValidation.isValid) {
      console.log('❌ Password validation failed:', passwordValidation.errors);
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: { password: passwordValidation.errors }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    // Handle photo upload if provided
    let photoData = {};
    if (req.file) {
      try {
        console.log('📸 Processing photo upload...');
        const uploadResult = await uploadImage(req.file);
        console.log('✅ Photo uploaded to Cloudinary:', uploadResult);
        
        photoData = {
          photo: uploadResult.secure_url || uploadResult.url,  // Handle both secure_url and url
          photoPublicId: uploadResult.public_id
        };
        
        console.log('📸 Final photo data:', photoData);
      } catch (uploadError) {
        console.error('❌ Photo upload failed:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Photo upload failed',
          errors: { photo: 'Failed to upload photo to Cloudinary' }
        });
      }
    } else {
      console.log('📸 No photo file provided');
    }

    // Create new user with proper field mapping
    const userData = {
      formNumber: cleanFormNumber,
      memberNumber: cleanMemberNumber,
      role: finalRole,  // Use the determined finalRole
      name: cleanFullName,                                                     // Map fullName to name
      email: cleanEmail,
      password: hashedPassword,
      applicationDate: cleanApplicationDate ? new Date(cleanApplicationDate) : undefined,
      motherName: cleanMotherName,
      fatherName: cleanFatherName,
      dateOfBirth: cleanBirthDate ? new Date(cleanBirthDate) : undefined,
      age: cleanAge ? parseInt(cleanAge) : undefined,
      phone: cleanMobileNumber,                // Map mobileNumber to phone
      nationalId: cleanNationalId,
      currentVillage: cleanCurrentVillage,
      currentPostOffice: cleanCurrentPostOffice,
      currentThana: cleanCurrentThana,
      currentDistrict: cleanCurrentDistrict,
      permanentVillage: cleanPermanentVillage,
      permanentPostOffice: cleanPermanentPostOffice,
      permanentThana: cleanPermanentThana,
      permanentDistrict: cleanPermanentDistrict,
      bloodGroup: cleanBloodGroup,
      ...photoData,
      ...otherFields
    };
    
    console.log('🚀 Creating user with mapped data:', userData);
    console.log('🔍 User model schema fields:', Object.keys(User.schema.paths));

    const user = new User(userData);
    console.log('✅ User model instance created');

    try {
      console.log('💾 Attempting to save user to database...');
      await user.save();
      console.log('✅ User saved successfully:', user._id);
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      console.error('❌ Validation errors:', saveError.errors);
      console.error('❌ Save error name:', saveError.name);
      console.error('❌ Save error message:', saveError.message);
      console.error('❌ Save error stack:', saveError.stack);
      
      // If user creation failed and photo was uploaded, delete it from Cloudinary
      if (photoData.photoPublicId) {
        try {
          console.log('🗑️ Deleting uploaded photo due to user creation failure...');
          // You can implement photo deletion here if needed
        } catch (deleteError) {
          console.error('❌ Failed to delete uploaded photo:', deleteError);
        }
      }
      
      // Format validation errors consistently
      let formattedErrors = {};
      if (saveError.errors) {
        Object.keys(saveError.errors).forEach(key => {
          formattedErrors[key] = saveError.errors[key].message || saveError.errors[key];
          console.error(`❌ Field validation error for ${key}:`, saveError.errors[key]);
        });
      }
      
      // Log the exact data that failed validation
      console.error('❌ Data that failed validation:', JSON.stringify(userData, null, 2));
      
      return res.status(400).json({
        success: false,
        message: 'User creation failed',
        errors: formattedErrors
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(res, userResponse, 'User created successfully', 201);
  } catch (error) {
    console.error('❌ Unexpected error in user creation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: { general: 'An unexpected error occurred' }
    });
  }
});

// Update user
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const { password, role, ...updateData } = req.body;
  
  // Only admins can change roles
  if (role && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can change user roles'
    });
  }

  // Only admins can update other users
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this user'
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      user[key] = updateData[key];
    }
  });

  // Handle role update
  if (role && req.user.role === 'admin') {
    user.role = role;
  }

  // Handle password update
  if (password) {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: passwordValidation.errors
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return successResponse(res, userResponse, 'User updated successfully');
}));

// Delete user (admin only)
router.delete('/:id', protect, authorize(['admin']), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  return successResponse(res, null, 'User deleted successfully');
}));

// Toggle user active status (admin only)
router.patch('/:id/toggle-status', protect, authorize(['admin']), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  return successResponse(res, { isActive: user.isActive }, 'User status updated successfully');
}));

// Get user statistics (admin only)
router.get('/stats/overview', protect, authorize(['admin']), asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const moderatorUsers = await User.countDocuments({ role: 'moderator' });
  const regularUsers = await User.countDocuments({ role: 'user' });

  const stats = {
    total: totalUsers,
    active: activeUsers,
    inactive: totalUsers - activeUsers,
    byRole: {
      admin: adminUsers,
      moderator: moderatorUsers,
      user: regularUsers
    }
  };

  return successResponse(res, stats, 'User statistics retrieved successfully');
}));

module.exports = router; 