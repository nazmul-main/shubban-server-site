const { validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');

// Validate request using express-validator
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));
    
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  next();
};

// Sanitize pagination parameters
const sanitizePagination = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  // Allow higher limits for admin users (up to 1000)
  const maxLimit = req.user && req.user.role === 'admin' ? 1000 : 100;
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || 10));
  
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };
  
  next();
};

// Sanitize search parameters
const sanitizeSearch = (req, res, next) => {
  const search = req.query.search ? req.query.search.trim() : '';
  const category = req.query.category ? req.query.category.trim() : '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  
  req.search = {
    search,
    category,
    sortBy,
    sortOrder,
  };
  
  next();
};

// Validate ObjectId
const isValidObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

// Validate email format
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  const minLength = 6;
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRequest,
  sanitizePagination,
  sanitizeSearch,
  isValidObjectId,
  isValidEmail,
  validatePassword,
}; 