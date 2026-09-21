const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const companyConfig = require('./config/company.config');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Dynamic CORS: allow frontend, localhost, and 127.0.0.1 on any dev port
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      env.NODE_ENV === 'development' ||
      origin === env.FRONTEND_URL ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));


// Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'JM Business Hub API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// Public Company Information Endpoint
// Exposes group & division metadata without hardcoding placeholders in the frontend
app.get('/api/public/company-info', (req, res) => {
  res.json({
    groupName: companyConfig.groupName,
    tagline: companyConfig.tagline,
    contactPerson: companyConfig.contactPerson,
    phone: companyConfig.phone,
    email: companyConfig.email,
    address: companyConfig.address,
    region: companyConfig.region,
    gstin: companyConfig.gstin,
    pan: companyConfig.pan,
    bank: companyConfig.bank,
    operatingHours: companyConfig.operatingHours,
    divisions: companyConfig.divisions
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error('💥 Server Error (500):', err);
  } else {
    console.warn(`⚠️ Client Error (${statusCode}):`, err.message);
  }

  res.status(statusCode).json({
    error: err.name || (statusCode === 409 ? 'Conflict' : statusCode === 401 ? 'Unauthorized' : 'Error'),
    message: env.NODE_ENV === 'production' && statusCode >= 500 ? 'An unexpected server error occurred.' : err.message
  });
});


module.exports = app;
