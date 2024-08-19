const mongoose = require('mongoose');

const compoundSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    estates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estate',
        required: true
      }
    ],
    compoundImages: {
      type: [String],
      required: true,
      default: []
    },
    address: {
      type: String,  
      required: true,
      default: null
    },
    city: {
      type: String,
      required: true,
      default: null
    },
    state: {
      type: String,
      required: true,
      default: null
    },
    description: {
      type: String,
      required: true,
      default: null
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    workers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: false
      }
    ],
  }, {
    timestamps: true
  });
  
const Compound = mongoose.model('Compound', compoundSchema);
module.exports = Compound;