import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply middleware
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: 'https://baby-cheetah.vercel.app/',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define routes
app.post('/api/updateCoins', async (req, res) => {
  try {
    // Implement coin update logic
    res.status(200).json({ message: 'Coins updated successfully' });
  } catch (_error) {
    // Use underscore prefix to indicate intentionally unused variable
    res.status(500).json({ error: 'Failed to update coins' });
  }
});

// Error handling middleware
app.use((err, req, res, _next) => {
  // Use underscore prefix for unused next parameter
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

// 404 Not Found middleware
app.use((_req, res, _next) => {
  res.status(404).json({
    message: 'Endpoint not found',
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Database connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

export default app;
