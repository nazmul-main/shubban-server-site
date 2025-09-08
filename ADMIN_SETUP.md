# Admin Credentials Setup

এই গাইড আপনাকে admin credentials সেটআপ করতে সাহায্য করবে।

## Environment Variables Setup

### 1. .env File তৈরি করুন

`shubban-server-side` directory তে `.env` file তৈরি করুন এবং নিচের content add করুন:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/subban

# JWT Configuration
JWT_SECRET=subban-super-secret-jwt-key-2024
JWT_EXPIRE=30d

# Admin Credentials
ADMIN_EMAIL=admin@shubban.org
ADMIN_PASSWORD=admin123

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

### 2. Admin Credentials পরিবর্তন করুন

Security এর জন্য অবশ্যই admin credentials পরিবর্তন করুন:

```env
# আপনার নিজের admin credentials ব্যবহার করুন
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Server Start করুন

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Security Features

✅ **Environment Variables**: Admin credentials এখন environment variables থেকে load হয়  
✅ **No Hardcoded Credentials**: কোডে আর hardcoded credentials নেই  
✅ **Git Ignored**: .env file git এ track হয় না  
✅ **Fallback Values**: Environment variables না থাকলে default values ব্যবহার হয়  

## Files Updated

- `env.example` - Admin credentials variables added
- `config/constants.js` - Admin credentials loading from env
- `scripts/auth.js` - Uses env variables
- `test-comprehensive.js` - Uses env variables  
- `test-user-creation.js` - Uses env variables
- `scripts/seedUsers.js` - Uses env variables

## Important Notes

⚠️ **Security Warning**: Production environment এ অবশ্যই strong password ব্যবহার করুন  
⚠️ **Environment Variables**: .env file কখনো git এ commit করবেন না  
⚠️ **JWT Secret**: Production এ unique JWT_SECRET ব্যবহার করুন  

## Testing

Admin credentials test করতে:

```bash
# Test authentication
node scripts/auth.js

# Test comprehensive
node test-comprehensive.js

# Test user creation
node test-user-creation.js
```
