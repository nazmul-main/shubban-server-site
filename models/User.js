const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  // Basic Information
  formNumber: {
    type: String,
    trim: true
  },
  memberNumber: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    trim: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  motherName: {
    type: String,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative']
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  nationalId: {
    type: String,
    trim: true
  },
  
  // Current Address
  currentVillage: {
    type: String,
    trim: true
  },
  currentPostOffice: {
    type: String,
    trim: true
  },
  currentThana: {
    type: String,
    trim: true
  },
  currentDistrict: {
    type: String,
    trim: true
  },
  
  // Permanent Address
  permanentVillage: {
    type: String,
    trim: true
  },
  permanentPostOffice: {
    type: String,
    trim: true
  },
  permanentThana: {
    type: String,
    trim: true
  },
  permanentDistrict: {
    type: String,
    trim: true
  },
  
  // Additional Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    trim: true
  },
  signature: {
    type: String, // Cloudinary URL
    trim: true
  },
  signaturePublicId: {
    type: String, // Cloudinary public_id for signature
    trim: true
  },
  photo: {
    type: String, // Cloudinary URL
    trim: true
  },
  photoPublicId: {
    type: String, // Cloudinary public_id for photo
    trim: true
  },
  
  // System Information
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ role: 1 });

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema); 