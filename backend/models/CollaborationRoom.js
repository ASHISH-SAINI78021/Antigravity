const mongoose = require('mongoose');
const crypto = require('crypto');

const CollaborationRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a room name'],
        trim: true
    },
    code: {
        type: String,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique room code before saving
CollaborationRoomSchema.pre('save', function() {
    if (!this.code) {
        this.code = crypto.randomBytes(4).toString('hex').toUpperCase();
    }
});

module.exports = mongoose.model('CollaborationRoom', CollaborationRoomSchema);
