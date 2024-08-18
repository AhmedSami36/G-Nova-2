const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Compound'
    }],
    contactInfo: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    }
});

const Developer = mongoose.model('Developer', developerSchema);
module.exports = Developer;