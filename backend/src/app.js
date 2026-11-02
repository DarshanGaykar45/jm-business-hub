const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const companyConfig = require('./config/company.config');

// Routes imports
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const publicRoutes = require('./routes/public.routes');
const employeesRoutes = require('./routes/employees.routes');
const projectsRoutes = require('./routes/projects.routes');
const customersRoutes = require('./routes/customers.routes');
const leadsRoutes = require('./routes/leads.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const rentalsRoutes = require('./routes/rentals.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const vehiclesRoutes = require('./routes/vehicles.routes');
const financeRoutes = require('./routes/finance.routes');
const quotationsRoutes = require('./routes/quotations.routes');
const invoicesRoutes = require('./routes/invoices.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const tasksRoutes = require('./routes/tasks.routes');
const documentsRoutes = require('./routes/documents.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const reportsRoutes = require('./routes/reports.routes');
const usersRoutes = require('./routes/users.routes');
const settingsRoutes = require('./routes/settings.routes');
const divisionsRoutes = require('./routes/divisions.routes');

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

// Mount Application Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/divisions', divisionsRoutes);

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
