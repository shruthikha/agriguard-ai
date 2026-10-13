const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'admin'],
    default: 'farmer'
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    state: { type: String, default: 'Tamil Nadu' },
    district: { type: String, default: 'Chengalpattu' },
    village: { type: String, default: 'Kattankulathur' },
    lat: { type: Number, default: 12.823 },
    lon: { type: Number, default: 80.044 }
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'mr', 'bn'],
    default: 'en'
  },
  farmDetails: {
    primaryCrop: { type: String, default: 'Tomato' },
    farmSize: { type: String, default: '2 Acres' },
    irrigationType: { type: String, default: 'Drip Irrigation' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
