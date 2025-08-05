const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');
const { sanitizePagination, sanitizeSearch } = require('../utils/validation');
const Blog = require('../models/Blog');

// Get all blogs (public)
router.get('/', sanitizePagination, sanitizeSearch, asyncHandler(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const { search, category, sortBy, sortOrder } = req.search;

  // Build query
  const query = { status: 'published' };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (category) {
    query.category = category;
  }

  // Execute query
  const blogs = await Blog.find(query)
    .populate('author', 'name email')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);

  return paginatedResponse(res, blogs, page, limit, total, 'Blogs retrieved successfully');
}));

// Get single blog by ID (public)
router.get('/:id', asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author', 'name email')
    .populate('comments.user', 'name');

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  return successResponse(res, blog, 'Blog retrieved successfully');
}));

// Create new blog (protected)
router.post('/', protect, authorize('admin', 'moderator'), asyncHandler(async (req, res) => {
  const blogData = {
    ...req.body,
    author: req.user._id,
  };

  const blog = await Blog.create(blogData);
  await blog.populate('author', 'name email');

  return successResponse(res, blog, 'Blog created successfully', 201);
}));

// Update blog (protected)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Check if user is author or admin
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this blog'
    });
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'name email');

  return successResponse(res, updatedBlog, 'Blog updated successfully');
}));

// Delete blog (protected)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Check if user is author or admin
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this blog'
    });
  }

  await Blog.findByIdAndDelete(req.params.id);

  return successResponse(res, null, 'Blog deleted successfully');
}));

// Like/Unlike blog (protected)
router.post('/:id/like', protect, asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  const likeIndex = blog.likes.indexOf(req.user._id);
  
  if (likeIndex > -1) {
    // Unlike
    blog.likes.splice(likeIndex, 1);
  } else {
    // Like
    blog.likes.push(req.user._id);
  }

  await blog.save();

  return successResponse(res, {
    liked: likeIndex === -1,
    likesCount: blog.likes.length
  }, likeIndex === -1 ? 'Blog liked' : 'Blog unliked');
}));

// Add comment to blog (protected)
router.post('/:id/comments', protect, asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  const comment = {
    user: req.user._id,
    content: req.body.content,
  };

  blog.comments.push(comment);
  await blog.save();

  await blog.populate('comments.user', 'name');

  return successResponse(res, blog.comments[blog.comments.length - 1], 'Comment added successfully', 201);
}));

module.exports = router; 