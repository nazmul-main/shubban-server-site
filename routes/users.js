const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const { successResponse } = require('../utils/response');
const { validatePassword } = require('../utils/validation');
const User = require('../models/User');
const router = express.Router();

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

// Create new user (admin only)
router.post('/', protect, authorize(['admin']), asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address, ...otherFields } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Password validation failed',
      errors: passwordValidation.errors
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: role || 'user',
    phone,
    address,
    ...otherFields
  });

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return successResponse(res, userResponse, 'User created successfully', 201);
}));

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