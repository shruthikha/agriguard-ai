const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded leaf images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter for Prediction Endpoint
const predictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 image predictions per minute per IP
  message: {
    success: false,
    message: 'Too many analysis requests. Please wait a moment before analyzing another image.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Services Health Check
const { checkMLHealth } = require('./services/mlService');

app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const mlStatus = await checkMLHealth();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AgriGuard AI Node.js Backend',
    database: {
      status: dbStatus,
      name: mongoose.connection.name
    },
    mlService: mlStatus
  });
});

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const scanRoutes = require('./routes/scanRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const advisoryRoutes = require('./routes/advisoryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { processDiseasePrediction } = require('./controllers/scanController');
const { optionalAuth } = require('./middleware/authMiddleware');
const upload = require('./middleware/uploadMiddleware');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/advisories', advisoryRoutes);
app.use('/api/admin', adminRoutes);

// Direct POST /api/predict route matching specification
app.post('/api/predict', predictLimiter, optionalAuth, upload.single('image'), processDiseasePrediction);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on AgriGuard Server`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('AgriGuard Server Error:', err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum allowed size is ${process.env.MAX_UPLOAD_SIZE_MB || 15}MB.`
      });
    }
    return res.status(400).json({
      success: false,
      message: `Image upload error: ${err.message}`
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// MongoDB Connection & Server Startup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agriguard';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully.');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`🌾 AgriGuard AI Backend running on port ${PORT}`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      });
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

module.exports = app;
