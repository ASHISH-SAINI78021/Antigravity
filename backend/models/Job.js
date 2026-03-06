const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    jobTitle: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    jobLink: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'],
        default: 'Saved'
    },
    resumeUsed: {
        type: mongoose.Schema.ObjectId,
        ref: 'Resume'
    },
    notes: {
        type: String
    },
    jobDescription: {
        type: String
    },
    followUpDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);
