const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const pollRoutes = require('./routes/pollRoutes');

// Import utilities
const { startWeeklyPoll } = require('./utils/pollAutomation');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Security Middlewares
app.use(helmet());
app.use(mongoSanitize());

// CORS Configuration
// Allows: localhost (dev), Vercel deployments, and the configured FRONTEND_URL (prod)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Allow any Vercel preview/production deployment
    const isVercel = /^https:\/\/.*\.vercel\.app$/.test(origin);

    // Allow any origin explicitly listed
    const isAllowed = allowedOrigins.includes(origin);

    if (isVercel || isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// Body Parser Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files (for local image uploads — not used in production with Cloudinary)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/polls', pollRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Poll Automation Cron Job
// Runs every Saturday at midnight (00:00)
const pollDay = process.env.POLL_DAY || 6; // 6 = Saturday (0 = Sunday)
const pollStartHour = process.env.POLL_START_HOUR || 0;

cron.schedule(`0 ${pollStartHour} * * ${pollDay}`, async () => {
  console.log('Starting weekly poll automation...');
  try {
    await startWeeklyPoll();
    console.log('Weekly poll started successfully');
  } catch (error) {
    console.error('Error starting weekly poll:', error.message);
  }
}, {
  timezone: "Asia/Kolkata"
});

console.log(`Poll automation scheduled: Every Saturday at ${pollStartHour}:00 IST`);

// Start Server — listen on 0.0.0.0 so Render/cloud can route to it
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
