const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { estimatedDocumentCount } = require('./UserModel');
require('dotenv').config();

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Method to generate a JWT token
adminSchema.methods.generateAuthToken = function() {
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
  adminSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
const State = mongoose.model('Admin', adminSchema);

module.exports = State;