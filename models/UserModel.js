const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  bio: { type: String, default: '' },
  favourite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Estate' }], // Array of estate IDs
  bookedBuildings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Building' }],
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  resetPasswordOTP: { type: String, default: '' },
  resetPasswordExpires: { type: Date, default: null },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: false
    },
    coordinates: {
      type: [Number], 
      required: false
    }
  }
});

// Method to generate a JWT token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
};

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.index({ location: '2dsphere' }); 
const User = mongoose.model('User', userSchema);

module.exports = User;
