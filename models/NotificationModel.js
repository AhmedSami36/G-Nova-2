const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin',
        required: false 
    },
    compound: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Compound', 
        required: false 
    },
    estate: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Estate', 
        required: false 
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Chat', 
        required: false 
    },
    message: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message', 
        required: false 
    },
    type: {
        type: String,
        enum: ['estate_update', 'new_message', 'new_offer', 'system_alert', 'compound_update'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
