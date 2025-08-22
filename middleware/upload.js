const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// Configure multer for file uploads - using memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
    files: 10 // Maximum 10 files
  }
});

// Single file upload middleware
const uploadSingle = upload.single('photo');

// Multiple files upload middleware
const uploadMultiple = upload.array('images', 10);

// Specific field upload middleware
const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// Error handling wrapper for multer
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    console.log('🔍 Multer middleware called for field:', req.file ? 'photo' : 'no file');
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('❌ Multer error:', err.code, err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum size is 3MB.', 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new AppError('Too many files. Maximum is 10 files.', 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected file field.', 400));
        }
        return next(new AppError('File upload error.', 400));
      } else if (err) {
        console.error('❌ Other upload error:', err.message);
        return next(err);
      }
      console.log('✅ Multer middleware completed successfully');
      next();
    });
  };
};

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple),
  uploadFields: handleUpload(uploadFields),
  upload
}; 