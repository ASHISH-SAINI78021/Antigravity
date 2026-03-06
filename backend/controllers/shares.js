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
        const existingJobs = await Job.find({ userId: req.user.id });

        // Create a set of "Company|Title" keys for fast lookup
        const existingKeys = new Set(
            existingJobs.map(j => `${j.companyName.toLowerCase().trim()}|${j.jobTitle.toLowerCase().trim()}`)
        );

        // Filter source jobs to only those that don't exist yet
        const newJobsData = sourceJobs
            .filter(job => {
                const key = `${job.companyName.toLowerCase().trim()}|${job.jobTitle.toLowerCase().trim()}`;
                return !existingKeys.has(key);
            })
            .map(job => {
                const jobData = job.toObject();
                delete jobData._id;
                delete jobData.createdAt;
                return {
                    ...jobData,
                    userId: req.user.id,
                    status: 'Saved',
                    resumeUsed: null,
                    notes: `[Imported] ${jobData.notes || ''}`
                };
            });

        if (newJobsData.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'All jobs in this share already exist in your dashboard.',
                importedCount: 0
            });
        }

        await Job.insertMany(newJobsData);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${newJobsData.length} new applications!`,
            importedCount: newJobsData.length
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
