const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const initCron = require('./cron/reminder');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Init Cron Jobs
initCron();

// Route files
const auth = require('./routes/auth');
const jobs = require('./routes/jobs');
const resumes = require('./routes/resumes');
const shares = require('./routes/shares');
const collaboration = require('./routes/collaboration');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
    }
});

// Attach io to request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data (Commented out if causing issues, but usually recommended)
// app.use(mongoSanitize());
// app.use(xss());
// app.use(helmet());

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});
app.use(limiter);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/jobs', jobs);
app.use('/api/resumes', resumes);
app.use('/api/shares', shares);
app.use('/api/collaboration', collaboration);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Antigravity API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error Stack:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
