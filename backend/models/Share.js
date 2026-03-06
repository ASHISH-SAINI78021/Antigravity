const mongoose = require('mongoose');
const crypto = require('crypto');

const ShareSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        unique: true
    },
    jobCount: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique token before saving
ShareSchema.pre('save', function() {
    if (!this.token) {
        this.token = crypto.randomBytes(16).toString('hex');
    }
});

module.exports = mongoose.model('Share', ShareSchema);
