module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'subban-super-secret-jwt-key-2024',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRE || '30d',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // CORS Configuration
  CORS_ORIGINS: {
    development: ['http://localhost:3000', 'http://localhost:3001'],
    production: ['https://subban.org', 'https://www.subban.org']
  },
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Cache Configuration
  CACHE_DURATION: {
    STATIC_ASSETS: 31536000, // 1 year
    API_RESPONSES: 3600, // 1 hour
  },
  
  // Validation
  PASSWORD_MIN_LENGTH: 6,
  NAME_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 10000,
  
  // Categories
  BLOG_CATEGORIES: ['ইসলামিক শিক্ষা', 'সমাজ উন্নয়ন', 'দাওয়াত', 'সামাজিক সেবা', 'সাধারণ'],
  GALLERY_CATEGORIES: ['ইসলামিক শিক্ষা', 'সমাজ উন্নয়ন', 'দাওয়াত', 'সামাজিক সেবা', 'ইভেন্ট', 'সাধারণ'],
  
  // User Roles
  USER_ROLES: ['user', 'admin', 'moderator'],
  
  // Blog Status
  BLOG_STATUS: ['draft', 'published', 'archived'],
}; 