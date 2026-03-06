const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).populate('resumeUsed', 'name version');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is owner
        if (job.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.userId = req.user.id;

        // Check for duplicates
        const existingJob = await Job.findOne({
            userId: req.user.id,
            companyName: { $regex: new RegExp(`^${req.body.companyName.trim()}$`, 'i') },
            jobTitle: { $regex: new RegExp(`^${req.body.jobTitle.trim()}$`, 'i') }
        });

        if (existingJob) {
            return res.status(400).json({
                success: false,
                message: `You already have an application for ${req.body.jobTitle} at ${req.body.companyName}`
            });
        }

        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is owner
        if (job.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is owner
        if (job.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await job.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
