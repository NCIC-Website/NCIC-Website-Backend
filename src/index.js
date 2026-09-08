// JavaScript version for Node.js compatibility
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const adminRouter = require('./routes/admin/admin.router');
const authRouter = require('./routes/auth/auth.router');
const contactRouter = require('./routes/contact/contact.router');
const newsletterRouter = require('./routes/newsletter/newsletter.router');
const testimonyRouter = require('./routes/testimony/testimony.router');
const bibleCollegeRouter = require('./routes/bibleCollege/bibleCollege.router');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/testimony', testimonyRouter);
app.use('/api/bible-college', bibleCollegeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NCIC Backend is running' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started 🚀 on port ${PORT}`);
  });
});

module.exports = app;