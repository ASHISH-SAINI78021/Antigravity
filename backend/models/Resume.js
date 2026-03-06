const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    resumeName: {
        type: String,
        required: [true, 'Please add a resume name'],
        trim: true
    },
    resumeUrl: {
        type: String,
        required: [true, 'Please add a resume URL']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resume', ResumeSchema);
