# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in the Subban server.

## Prerequisites

1. A Cloudinary account (free tier available)
2. Node.js and npm installed

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. After signing up, you'll get your credentials from the dashboard

### 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard, you'll need:
- **Cloud Name**: Found in the dashboard
- **API Key**: Found in the dashboard
- **API Secret**: Found in the dashboard

### 3. Set Environment Variables

Create a `.env` file in the `subban-server-side` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/subban

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Replace the Cloudinary values with your actual credentials:
- `your-cloud-name`: Your Cloudinary cloud name
- `your-api-key`: Your Cloudinary API key
- `your-api-secret`: Your Cloudinary API secret

### 4. Install Dependencies

The required packages are already installed:
- `cloudinary`: For Cloudinary integration
- `multer`: For handling file uploads

### 5. Create Uploads Directory

The server will automatically create an `uploads/` directory when needed, but you can create it manually:

```bash
mkdir uploads
```

## API Endpoints

### Upload Endpoints

1. **Upload Single Image**
   - `POST /api/upload/single`
   - Requires authentication
   - Form field: `image`

2. **Upload Multiple Images**
   - `POST /api/upload/multiple`
   - Requires authentication
   - Form field: `images`

3. **Upload User Files**
   - `POST /api/upload/user-files`
   - Requires authentication
   - Form fields: `photo`, `signature`, `images`

4. **Upload Base64 Image**
   - `POST /api/upload/base64`
   - Requires authentication
   - Body: `{ "image": "data:image/jpeg;base64,...", "folder": "optional" }`

5. **Delete Image**
   - `DELETE /api/upload/:public_id`
   - Requires authentication

6. **Upload Gallery Images** (Admin only)
   - `POST /api/upload/gallery`
   - Requires admin authentication
   - Form field: `images`

7. **Upload Blog Images** (Admin only)
   - `POST /api/upload/blog`
   - Requires admin authentication
   - Form field: `images`

### User Management with Images

The user creation and update endpoints now support image uploads:

1. **Create User with Images**
   - `POST /api/users`
   - Admin only
   - Form fields: `photo`, `signature` (optional)

2. **Update User with Images**
   - `PUT /api/users/:id`
   - Admin only
   - Form fields: `photo`, `signature` (optional)

## Features

### Image Optimization
- Automatic quality optimization
- Format conversion to WebP when beneficial
- Size limit: 5MB per image
- Supported formats: JPEG, PNG, WebP

### File Management
- Automatic cleanup of temporary files
- Cloudinary public_id tracking for easy deletion
- Organized folder structure:
  - `subban/users/photos` - User photos
  - `subban/users/signatures` - User signatures
  - `subban/gallery` - Gallery images
  - `subban/blog` - Blog images

### Security
- File type validation
- File size limits
- Authentication required for all uploads
- Admin-only access for certain endpoints

## Usage Examples

### Frontend Upload Example

```javascript
// Upload single image
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.data.url); // Cloudinary URL
```

### Create User with Image

```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'password123');
formData.append('photo', photoFile);
formData.append('signature', signatureFile);

const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Troubleshooting

### Common Issues

1. **"No file uploaded" error**
   - Check if the form field name matches the expected field name
   - Ensure the file is actually selected

2. **"File too large" error**
   - Reduce image size (max 5MB)
   - Compress image before upload

3. **"Invalid file type" error**
   - Only JPEG, PNG, and WebP are supported
   - Convert image to supported format

4. **Cloudinary authentication error**
   - Check your Cloudinary credentials in .env file
   - Ensure all three variables are set correctly

### Testing

You can test the upload functionality using tools like:
- Postman
- Insomnia
- curl commands

Example curl command:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  http://localhost:5000/api/upload/single
```

## Security Notes

- Always validate file types on both client and server
- Implement proper authentication and authorization
- Consider implementing virus scanning for uploaded files
- Monitor Cloudinary usage to stay within free tier limits
- Regularly clean up unused images to save storage costs 