const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Gallery = require('../models/Gallery');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const blogRoutes = require('./blogs');
const galleryRoutes = require('./gallery');
const userRoutes = require('./users');
const uploadRoutes = require('./upload');

// Mount routes
router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/gallery', galleryRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

// Get dashboard statistics
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    // Get counts from database
    const totalUsers = await User.countDocuments(); // Count all users
    const totalBlogs = await Blog.countDocuments({ isPublished: true });
    const totalGalleryItems = await Gallery.countDocuments({ isActive: true });
    
    // Debug: Log the actual count
    console.log('📊 Stats API - Total users in database:', totalUsers);
    
    // Get active sessions (for now, we'll use a simple calculation)
    // In a real app, you might track this differently
    const activeSessions = Math.floor(Math.random() * 20) + 5; // Placeholder
    
    const stats = {
      totalUsers,
      totalBlogs,
      totalGalleryItems,
      activeSessions
    };
    
    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
}));

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router; 