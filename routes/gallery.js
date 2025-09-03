const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');
const { sanitizePagination, sanitizeSearch } = require('../utils/validation');
const Gallery = require('../models/Gallery');

// Get all gallery items (public)
router.get('/', sanitizePagination, sanitizeSearch, asyncHandler(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const { search, category, sortBy, sortOrder } = req.search;

  // Build query
  const query = { isPublic: true };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  if (category) {
    query.category = category;
  }

  // Execute query
  const images = await Gallery.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await Gallery.countDocuments(query);

  return paginatedResponse(res, images, page, limit, total, 'Gallery items retrieved successfully');
}));

// Get single gallery item by ID (public)
router.get('/:id', asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id)
    .populate('uploadedBy', 'name email')
    .populate('likes', 'name');

  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Increment views
  image.views += 1;
  await image.save();

  return successResponse(res, image, 'Image retrieved successfully');
}));

// Upload new image (protected)
router.post('/', protect, authorize('moderator'), asyncHandler(async (req, res) => {
  const imageData = {
    ...req.body,
    uploadedBy: req.user._id,
  };

  const image = await Gallery.create(imageData);
  await image.populate('uploadedBy', 'name email');

  return successResponse(res, image, 'Image uploaded successfully', 201);
}));

// Update gallery item (protected)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);

  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Check if user is uploader
  if (image.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this image'
    });
  }

  const updatedImage = await Gallery.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('uploadedBy', 'name email');

  return successResponse(res, updatedImage, 'Image updated successfully');
}));

// Delete gallery item (protected)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);

  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Check if user is uploader
  if (image.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this image'
    });
  }

  await Gallery.findByIdAndDelete(req.params.id);

  return successResponse(res, null, 'Image deleted successfully');
}));

// Like/Unlike image (protected)
router.post('/:id/like', protect, asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);

  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  const likeIndex = image.likes.indexOf(req.user._id);
  
  if (likeIndex > -1) {
    // Unlike
    image.likes.splice(likeIndex, 1);
  } else {
    // Like
    image.likes.push(req.user._id);
  }

  await image.save();

  return successResponse(res, {
    liked: likeIndex === -1,
    likesCount: image.likes.length
  }, likeIndex === -1 ? 'Image liked' : 'Image unliked');
}));

// Get gallery categories
router.get('/categories/list', asyncHandler(async (req, res) => {
  const categories = await Gallery.distinct('category');
  
  return successResponse(res, categories, 'Categories retrieved successfully');
}));

// Get featured images
router.get('/featured/list', asyncHandler(async (req, res) => {
  const featuredImages = await Gallery.find({ 
    isFeatured: true, 
    isPublic: true 
  })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  return successResponse(res, featuredImages, 'Featured images retrieved successfully');
}));

module.exports = router; 