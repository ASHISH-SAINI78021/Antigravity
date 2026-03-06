const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const Share = require('./models/Share');
const { generateShare } = require('./controllers/shares');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const mockReq = {
            user: { id: '67c588be080be86a073f324c' } // Use a real ID from your DB if possible
        };
        const mockRes = {
            status: function(code) {
                console.log('Status code:', code);
                return this;
            },
            json: function(data) {
                console.log('Response data:', JSON.stringify(data, null, 2));
                return this;
            }
        };
        const mockNext = (err) => {
            console.log('Next called with:', err);
        };

        console.log('Running generateShare...');
        await generateShare(mockReq, mockRes, mockNext);

        await mongoose.connection.close();
    } catch (err) {
        console.error('Test failed:', err);
    }
};

test();
