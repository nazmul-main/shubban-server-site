const cloudinary = require('../config/cloudinary');
const { AppError } = require('../middleware/errorHandler');

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'subban') => {
  try {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400);
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new AppError('File size too large. Maximum size is 5MB.', 500);
    }

    // Convert buffer to data URI for Cloudinary
    let uploadData;
    if (file.buffer) {
      // Memory storage - convert buffer to data URI
      const base64String = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64String}`;
      uploadData = dataURI;
    } else if (file.path) {
      // Disk storage fallback
      uploadData = file.path;
    } else {
      throw new AppError('Invalid file format', 400);
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(uploadData, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    // Check for specific Cloudinary errors
    if (error.message && error.message.includes('Invalid credentials')) {
      throw new AppError('Cloudinary credentials are invalid. Please check your environment variables.', 500);
    }
    
    if (error.message && error.message.includes('cloud_name')) {
      throw new AppError('Cloudinary cloud name is not configured.', 500);
    }
    
    if (error.message && error.message.includes('api_key')) {
      throw new AppError('Cloudinary API key is not configured.', 500);
    }
    
    if (error.message && error.message.includes('api_secret')) {
      throw new AppError('Cloudinary API secret is not configured.', 500);
    }
    
    throw new AppError(`Failed to upload image: ${error.message}`, 500);
  }
};

// Upload base64 image to Cloudinary
const uploadBase64Image = async (base64String, folder = 'subban') => {
  try {
    if (!base64String) {
      throw new AppError('No base64 string provided', 400);
    }

    // Upload base64 to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to upload base64 image', 500);
  }
};

// Delete image from Cloudinary
const deleteImage = async (public_id) => {
  try {
    if (!public_id) {
      throw new AppError('No public_id provided', 400);
    }

    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete image', 500);
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'subban') => {
  try {
    if (!files || !Array.isArray(files)) {
      throw new AppError('No files provided', 400);
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to upload multiple images', 500);
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (public_id, options = {}) => {
  try {
    if (!public_id) {
      throw new AppError('No public_id provided', 400);
    }

    const defaultOptions = {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    return cloudinary.url(public_id, finalOptions);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to generate optimized URL', 500);
  }
};

module.exports = {
  uploadImage,
  uploadBase64Image,
  deleteImage,
  uploadMultipleImages,
  getOptimizedImageUrl
}; 