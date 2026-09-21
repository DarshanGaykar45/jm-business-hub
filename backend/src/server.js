const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 JM Business Hub Backend API Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌐 CORS Allowed Origin: ${env.FRONTEND_URL}`);
  console.log(`🔒 Environment: ${env.NODE_ENV}`);
  console.log(`=========================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
    console.error(`👉 Stop any running process on port ${PORT} or change PORT in backend/.env`);
    process.exit(1);
  } else {
    console.error('❌ Server startup error:', err);
  }
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
