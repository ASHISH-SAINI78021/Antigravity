const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this id'
            });
        }

        // --- Streak Tracker Logic (Safe & Non-blocking) ---
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastActive = req.user.lastActivityDate ? new Date(req.user.lastActivityDate) : null;
            if (lastActive) lastActive.setHours(0, 0, 0, 0);

            const diffInDays = lastActive ? Math.floor((today - lastActive) / (1000 * 60 * 60 * 24)) : null;

            let shouldSave = false;

            if (diffInDays === null) {
                req.user.currentStreak = 1;
                req.user.longestStreak = 1;
                req.user.lastActivityDate = today;
                shouldSave = true;
            } else if (diffInDays === 1) {
                req.user.currentStreak += 1;
                if (req.user.currentStreak > req.user.longestStreak) {
                    req.user.longestStreak = req.user.currentStreak;
                }
                req.user.lastActivityDate = today;
                shouldSave = true;
            } else if (diffInDays > 1) {
                req.user.currentStreak = 1;
                req.user.lastActivityDate = today;
                shouldSave = true;
            }

            if (shouldSave) {
                await User.findByIdAndUpdate(req.user.id, {
                    currentStreak: req.user.currentStreak,
                    longestStreak: req.user.longestStreak,
                    lastActivityDate: req.user.lastActivityDate
                });
            }
        } catch (streakErr) {
            console.error('Streak Update Failed (Silently continuing):', streakErr);
        }

        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
