const Resume = require('../models/Resume');

// @desc    Get all resumes for user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Upload a resume
// @route   POST /api/resumes
// @access  Private
exports.uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const resume = await Resume.create({
            userId: req.user.id,
            resumeName: req.body.resumeName || req.file.originalname,
            resumeUrl: req.file.path
        });

        res.status(201).json({
            success: true,
            data: resume
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }

        // Make sure user is owner
        if (resume.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await resume.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
