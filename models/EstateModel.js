const mongoose = require('mongoose');

const estateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  offer: {
    type: Boolean,
    required: false,
    default: false,
  },
  discountPercentage: {
    type: Number,
    required: false,
    default: null,
  },
  originalSellPrice: {
    type: Number,
    required: false,
  },
  originalRentPrice: {
    type: Number,
    required: false,
  },
  type: {
    type: String,
    enum: ['rent', 'buy'],
    required: true,
  },
  category: {
    type: String,
    enum: [
      'house', 'apartment', 'hotel', 'villa', 'cottage', 'twin',
      'chalet', 'studio', 'clinic', 'office', 'duplex', 'town',
      'penthouse', 'cabin', 'retail'
    ],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  mapLocation: {
    type: String,
    required: true,
  },
  photos: {
    type: [String],
    default: [],
  },
  sellPrice: {
    type: Number,
    required: function() { return this.type === 'buy'; },
  },
  rentPrice: {
    type: Number,
    required: function() { return this.type === 'rent'; },
  },
  rentDuration: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: function() { return this.type === 'rent'; },
  },
  features: {
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    balconies: {
      type: Number,
      default: 0,
    },
    totalRooms: {
      type: Number,
      required: true,
    }
  },
}, {
  timestamps: true
});

estateSchema.methods.makeOffer = function(discountPercentage) {
  this.offer = true;
  this.discountPercentage = discountPercentage || 0;

  if (this.type === 'buy') {
    if (!this.originalSellPrice) this.originalSellPrice = this.sellPrice;
    this.sellPrice = this.originalSellPrice - (this.originalSellPrice * (this.discountPercentage / 100));
  } else if (this.type === 'rent') {
    if (!this.originalRentPrice) this.originalRentPrice = this.rentPrice;
    this.rentPrice = this.originalRentPrice - (this.originalRentPrice * (this.discountPercentage / 100));
  }

  return this.save();
};

estateSchema.methods.removeOffer = function() {
    if (this.offer) {
        this.offer = false;
        this.discountPercentage = null;

        if (this.type === 'buy' && this.originalSellPrice) {
            this.sellPrice = this.originalSellPrice;
            this.originalSellPrice = null;  // Reset after restoring
        } else if (this.type === 'rent' && this.originalRentPrice) {
            this.rentPrice = this.originalRentPrice;
            this.originalRentPrice = null;  // Reset after restoring
        }
    }

    return this.save();
};

const Estate = mongoose.model('Estate', estateSchema);

module.exports = Estate;
