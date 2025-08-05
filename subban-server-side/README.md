# Subban Server API

A clean, modular, and reusable Node.js/Express server with MongoDB integration for the Subban organization website.

## 🚀 Features

- **Clean Architecture**: Modular structure with separation of concerns
- **Security**: Helmet, CORS, Rate limiting, JWT authentication
- **Database**: MongoDB with Mongoose ODM
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Request validation and sanitization
- **Response Formatting**: Consistent API response structure
- **Pagination**: Built-in pagination support
- **Logging**: Comprehensive error logging
- **Graceful Shutdown**: Proper server shutdown handling

## 📁 Project Structure

```
subban-server-side/
├── config/                 # Configuration files
│   ├── constants.js        # Application constants
│   └── database.js         # Database connection
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Error handling middleware
│   └── security.js        # Security middleware
├── models/                 # Mongoose models
│   ├── User.js            # User model
│   ├── Blog.js            # Blog model
│   └── Gallery.js         # Gallery model
├── routes/                 # API routes
│   ├── index.js           # Main routes index
│   ├── auth.js            # Authentication routes
│   ├── blogs.js           # Blog routes
│   ├── gallery.js         # Gallery routes
│   └── users.js           # User management routes
├── utils/                  # Utility functions
│   ├── response.js        # Response formatting
│   └── validation.js      # Validation utilities
├── index.js               # Main server file
├── package.json           # Dependencies
└── README.md              # This file
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd subban-server-side
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Blogs
- `GET /api/blogs` - Get all published blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create blog (admin/moderator)
- `PUT /api/blogs/:id` - Update blog (author/admin)
- `DELETE /api/blogs/:id` - Delete blog (author/admin)
- `POST /api/blogs/:id/like` - Like/unlike blog (protected)
- `POST /api/blogs/:id/comments` - Add comment (protected)

### Gallery
- `GET /api/gallery` - Get all public images
- `GET /api/gallery/:id` - Get single image
- `POST /api/gallery` - Upload image (admin/moderator)
- `PUT /api/gallery/:id` - Update image (uploader/admin)
- `DELETE /api/gallery/:id` - Delete image (uploader/admin)
- `POST /api/gallery/:id/like` - Like/unlike image (protected)
- `GET /api/gallery/categories/list` - Get categories
- `GET /api/gallery/featured/list` - Get featured images

### Users
- `GET /api/users/me` - Get current user profile (protected)
- `PUT /api/users/me` - Update current user profile (protected)
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/stats/overview` - User statistics (admin)

### Health Check
- `GET /api/health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt password hashing
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time

### Constants
All application constants are centralized in `config/constants.js`:
- Rate limiting settings
- CORS origins
- File upload limits
- Validation rules
- Categories and roles

## 🚀 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)
- `npm run lint` - Run linter (placeholder)
- `npm run clean` - Clean and reinstall dependencies

## 📚 Database Models

### User Model
- Authentication fields (email, password)
- Profile information (name, phone, address)
- Role-based access control
- Account status tracking

### Blog Model
- Content management (title, content, excerpt)
- Categorization and tagging
- Author relationships
- Engagement tracking (views, likes, comments)

### Gallery Model
- Image management (title, description, URL)
- Categorization and tagging
- Upload tracking
- Engagement tracking (views, likes)

## 🔄 Middleware

### Authentication Middleware
- `protect`: Require authentication
- `authorize`: Role-based authorization
- `optionalAuth`: Optional authentication

### Error Handling
- Centralized error handling
- Custom error classes
- Development/production error responses
- Async error wrapper

### Security
- Helmet configuration
- CORS setup
- Rate limiting
- Cache control

## 🧪 Testing

Testing setup is prepared but not implemented. Add your preferred testing framework (Jest, Mocha, etc.).

## 📈 Monitoring

The server includes:
- Health check endpoint
- Error logging
- Request logging
- Performance monitoring ready

## 🚀 Deployment

1. Set environment variables
2. Install dependencies: `npm install --production`
3. Start server: `npm start`
4. Use PM2 or similar for process management

## 🤝 Contributing

1. Follow the existing code structure
2. Use the established patterns
3. Add proper error handling
4. Include validation
5. Update documentation

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ for Subban Organization** 