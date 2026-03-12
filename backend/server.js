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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parser Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files (for local image uploads)
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
    timestamp: new Date().toISOString()
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Poll Automation Cron Job
// Runs every Saturday at midnight (00:00)
// Cron format: second minute hour day-of-month month day-of-week
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
  timezone: "America/New_York" // Adjust to your timezone
});

console.log(`Poll automation scheduled: Every Saturday at ${pollStartHour}:00`);

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
