const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');
const { uploadSingle, uploadMultiple, uploadFields } = require('../middleware/upload');
const { uploadImage, uploadBase64Image, deleteImage, uploadMultipleImages } = require('../utils/upload');

// Upload single image
router.post('/single', protect, uploadSingle, asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📁 File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const result = await uploadImage(req.file, 'subban/users');

    console.log('✅ Image uploaded successfully:', result.url);
    return successResponse(res, result, 'Image uploaded successfully');
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Return specific error message
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}));

// Upload multiple images
router.post('/multiple', protect, uploadMultiple, asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = await uploadMultipleImages(req.files, 'subban/users');

    return successResponse(res, results, 'Images uploaded successfully');
  } catch (error) {
    throw error;
  }
}));

// Upload user photo and signature
router.post('/user-files', uploadFields, asyncHandler(async (req, res) => {
  try {
    const results = {};
    
    // Upload photo if provided
    if (req.files && req.files.photo && req.files.photo[0]) {
      const photoResult = await uploadImage(req.files.photo[0], 'subban/users/photos');
      results.photo = photoResult;
    }
    
    // Upload signature if provided
    if (req.files && req.files.signature && req.files.signature[0]) {
      const signatureResult = await uploadImage(req.files.signature[0], 'subban/users/signatures');
      results.signature = signatureResult;
    }
    
    // Upload additional images if provided
    if (req.files && req.files.images && req.files.images.length > 0) {
      const imagesResult = await uploadMultipleImages(req.files.images, 'subban/users/images');
      results.images = imagesResult;
    }

    return successResponse(res, results, 'Files uploaded successfully');
  } catch (error) {
    throw error;
  }
}));

// Upload base64 image
router.post('/base64', protect, asyncHandler(async (req, res) => {
  const { image, folder = 'subban/users' } = req.body;
  
  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'No base64 image provided'
    });
  }

  const result = await uploadBase64Image(image, folder);
  return successResponse(res, result, 'Base64 image uploaded successfully');
}));

// Delete image
router.delete('/:public_id', protect, asyncHandler(async (req, res) => {
  const { public_id } = req.params;
  
  const result = await deleteImage(public_id);
  return successResponse(res, result, 'Image deleted successfully');
}));

// Upload gallery images (admin only)
router.post('/gallery', protect, authorize('admin'), uploadMultiple, asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = await uploadMultipleImages(req.files, 'subban/gallery');

    return successResponse(res, results, 'Gallery images uploaded successfully');
  } catch (error) {
    throw error;
  }
}));

// Upload blog images (admin only)
router.post('/blog', protect, authorize('admin'), uploadMultiple, asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = await uploadMultipleImages(req.files, 'subban/blog');

    return successResponse(res, results, 'Blog images uploaded successfully');
  } catch (error) {
    throw error;
  }
}));

module.exports = router; 