const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const workerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  profilePic: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  bio: { type: String, default: '' },
  workAt: {
    type: String,
    default: '' 
  }
  });


const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;
