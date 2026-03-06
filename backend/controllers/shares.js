const Share = require('../models/Share');
const Job = require('../models/Job');

// @desc    Generate a share token for all user's jobs
// @route   POST /api/shares/generate
// @access  Private
exports.generateShare = async (req, res, next) => {
    try {
        const jobs = await Job.find({ userId: req.user.id });
        
        if (jobs.length === 0) {
            return res.status(400).json({ success: false, message: 'No applications to share' });
        }

        // Check if a share already exists for this user (optional: update or create new)
        const share = await Share.create({
            userId: req.user.id,
            jobCount: jobs.length
        });

        res.status(201).json({
            success: true,
            data: share
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get share details (who shared, how many jobs)
// @route   GET /api/shares/:token
// @access  Private
exports.getShare = async (req, res, next) => {
    try {
        const share = await Share.findOne({ token: req.params.token }).populate('userId', 'name');

        if (!share) {
            return res.status(404).json({ success: false, message: 'Invalid or expired share link' });
        }

        if (share.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'Share link has expired' });
        }

        const jobs = await Job.find({ userId: share.userId }).select('companyName jobTitle jobDescription');

        res.status(200).json({
            success: true,
            data: {
                sharedBy: share.userId.name,
                jobCount: share.jobCount,
                createdAt: share.createdAt,
                jobs: jobs
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Import jobs from a share token
// @route   POST /api/shares/:token/import
// @access  Private
exports.importJobs = async (req, res, next) => {
    try {
        const share = await Share.findOne({ token: req.params.token });

        if (!share) {
            return res.status(404).json({ success: false, message: 'Invalid share link' });
        }

        if (share.userId.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot import your own shared jobs' });
        }

        const sourceJobs = await Job.find({ userId: share.userId });
        
        // Deep copy jobs to new user
        const newJobs = sourceJobs.map(job => {
            const jobData = job.toObject();
            delete jobData._id;
            delete jobData.createdAt;
            return {
                ...jobData,
                userId: req.user.id,
                status: 'Saved', // Default status for imported jobs
                resumeUsed: null, // Reset resume as it's user-specific
                notes: `[Imported] ${jobData.notes || ''}`
            };
        });

        await Job.insertMany(newJobs);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${newJobs.length} applications!`
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
