const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');
const { sanitizePagination } = require('../utils/validation');
const { uploadFields } = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../utils/upload');
const User = require('../models/User');
const fs = require('fs');

// Get current user profile (protected)
router.get('/me', protect, asyncHandler(async (req, res) => {
  return successResponse(res, req.user, 'User profile retrieved successfully');
}));

// Update current user profile (protected)
router.put('/me', protect, asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  ).select('-password');

  return successResponse(res, updatedUser, 'Profile updated successfully');
}));

// Create a new user (Admin only)
router.post('/', protect, authorize('admin'), uploadFields, asyncHandler(async (req, res) => {
  const {
    formNumber,
    memberNumber,
    academicYear,
    applicationDate,
    name,
    motherName,
    fatherName,
    dateOfBirth,
    age,
    email,
    password,
    phone,
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
    signature,
    photo,
    role
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'এই ইমেইল দিয়ে ইতিমধ্যে একজন ব্যবহারকারী রয়েছে'
    });
  }

  // Handle image uploads
  let photoUrl = photo;
  let photoPublicId = null;
  let signatureUrl = signature;
  let signaturePublicId = null;

  // Upload photo if file is provided
  if (req.files && req.files.photo && req.files.photo[0]) {
    try {
      const photoResult = await uploadImage(req.files.photo[0], 'subban/users/photos');
      photoUrl = photoResult.url;
      photoPublicId = photoResult.public_id;
      
      // Clean up uploaded file
      if (fs.existsSync(req.files.photo[0].path)) {
        fs.unlinkSync(req.files.photo[0].path);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      // Clean up uploaded file on error
      if (req.files.photo[0] && fs.existsSync(req.files.photo[0].path)) {
        fs.unlinkSync(req.files.photo[0].path);
      }
    }
  }

  // Upload signature if file is provided
  if (req.files && req.files.signature && req.files.signature[0]) {
    try {
      const signatureResult = await uploadImage(req.files.signature[0], 'subban/users/signatures');
      signatureUrl = signatureResult.url;
      signaturePublicId = signatureResult.public_id;
      
      // Clean up uploaded file
      if (fs.existsSync(req.files.signature[0].path)) {
        fs.unlinkSync(req.files.signature[0].path);
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      // Clean up uploaded file on error
      if (req.files.signature[0] && fs.existsSync(req.files.signature[0].path)) {
        fs.unlinkSync(req.files.signature[0].path);
      }
    }
  }

  // Create new user
  const user = new User({
    formNumber,
    memberNumber,
    academicYear,
    applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
    name,
    motherName,
    fatherName,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    age,
    email,
    password,
    phone,
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
    signature: signatureUrl,
    signaturePublicId,
    photo: photoUrl,
    photoPublicId,
    role: role || 'user'
  });

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return successResponse(res, userResponse, 'ব্যবহারকারী সফলভাবে তৈরি হয়েছে');
}));

// Get all users (admin only)
router.get('/', protect, authorize('admin'), sanitizePagination, asyncHandler(async (req, res) => {
  const { page, limit, skip } = req.pagination;

  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  return paginatedResponse(res, users, page, limit, total, 'Users retrieved successfully');
}));

// Get user by ID (admin only)
router.get('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  return successResponse(res, user, 'User retrieved successfully');
}));

// Update user by ID (admin only)
router.put('/:id', protect, authorize('admin'), uploadFields, asyncHandler(async (req, res) => {
  const { name, email, role, isActive, phone, address } = req.body;

  // Get current user to check for existing images
  const currentUser = await User.findById(req.params.id);
  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Handle image uploads
  let updateData = { name, email, role, isActive, phone, address };

  // Upload photo if file is provided
  if (req.files && req.files.photo && req.files.photo[0]) {
    try {
      // Delete old photo if exists
      if (currentUser.photoPublicId) {
        await deleteImage(currentUser.photoPublicId);
      }

      const photoResult = await uploadImage(req.files.photo[0], 'subban/users/photos');
      updateData.photo = photoResult.url;
      updateData.photoPublicId = photoResult.public_id;
      
      // Clean up uploaded file
      if (fs.existsSync(req.files.photo[0].path)) {
        fs.unlinkSync(req.files.photo[0].path);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      // Clean up uploaded file on error
      if (req.files.photo[0] && fs.existsSync(req.files.photo[0].path)) {
        fs.unlinkSync(req.files.photo[0].path);
      }
    }
  }

  // Upload signature if file is provided
  if (req.files && req.files.signature && req.files.signature[0]) {
    try {
      // Delete old signature if exists
      if (currentUser.signaturePublicId) {
        await deleteImage(currentUser.signaturePublicId);
      }

      const signatureResult = await uploadImage(req.files.signature[0], 'subban/users/signatures');
      updateData.signature = signatureResult.url;
      updateData.signaturePublicId = signatureResult.public_id;
      
      // Clean up uploaded file
      if (fs.existsSync(req.files.signature[0].path)) {
        fs.unlinkSync(req.files.signature[0].path);
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      // Clean up uploaded file on error
      if (req.files.signature[0] && fs.existsSync(req.files.signature[0].path)) {
        fs.unlinkSync(req.files.signature[0].path);
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  return successResponse(res, updatedUser, 'User updated successfully');
}));

// Delete user by ID (admin only)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  // Delete associated images from Cloudinary
  try {
    if (user.photoPublicId) {
      await deleteImage(user.photoPublicId);
    }
    if (user.signaturePublicId) {
      await deleteImage(user.signaturePublicId);
    }
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    // Continue with user deletion even if image deletion fails
  }

  await User.findByIdAndDelete(req.params.id);

  return successResponse(res, null, 'User deleted successfully');
}));

// Get user statistics (admin only)
router.get('/stats/overview', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const moderatorUsers = await User.countDocuments({ role: 'moderator' });
  
  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    adminUsers,
    moderatorUsers,
    regularUsers: totalUsers - adminUsers - moderatorUsers,
    recentRegistrations,
  };

  return successResponse(res, stats, 'User statistics retrieved successfully');
}));

module.exports = router; 