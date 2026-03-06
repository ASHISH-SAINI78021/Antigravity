const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Job = require('../models/Job');
const User = require('../models/User');

const sendReminders = async () => {
    try {
        // Find jobs with followUpDate = today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const jobs = await Job.find({
            followUpDate: {
                $gte: today,
                $lt: tomorrow
            },
            status: { $ne: 'Rejected' }
        }).populate('userId');

        if (jobs.length === 0) {
            console.log('No follow-up reminders for today.');
            return;
        }

        // Setup email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        for (const job of jobs) {
            const mailOptions = {
                from: `"Antigravity Support" <${process.env.EMAIL_USER}>`,
                to: job.userId.email,
                subject: `Follow-up Reminder: ${job.companyName}`,
                text: `Hi ${job.userId.name},\n\nThis is a reminder to follow up on your application for ${job.jobTitle} at ${job.companyName}.\n\nGood luck!\n\n- Antigravity Team`
            };

            await transporter.sendMail(mailOptions);
            console.log(`Reminder sent to ${job.userId.email} for ${job.companyName}`);
        }
    } catch (error) {
        console.error('Error in reminder cron job:', error);
    }
};

// Run every day at 9:00 AM
const initCron = () => {
    cron.schedule('0 9 * * *', () => {
        console.log('Running daily follow-up reminder cron job...');
        sendReminders();
    });
};

module.exports = initCron;
