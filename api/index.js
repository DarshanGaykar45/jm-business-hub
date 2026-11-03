const path = require('path');
const Module = require('module');

// 1. Ensure backend/node_modules is in module search paths for serverless bundling
const backendModules = path.resolve(__dirname, '../backend/node_modules');
if (!module.paths.includes(backendModules)) {
  module.paths.unshift(backendModules);
}
if (Module.globalPaths && !Module.globalPaths.includes(backendModules)) {
  Module.globalPaths.unshift(backendModules);
}

// 2. Set default fallback environment variables if not present in Vercel settings
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_UjFrdGRB7Tv4@ep-jolly-lab-b4if0692.c-6.us-east-2.aws.neon.tech/jm_business_hub?sslmode=require';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'jm_hub_jwt_secret_dev_32_bytes_super_secure_key_2026!';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jm_hub_jwt_refresh_secret_dev_32_bytes_secure_key_2026!';
process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || 'jm_hub_cookie_secret_dev_32_bytes_secure_key_2026!';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://jm-business-hub.vercel.app';

let app;
let initError = null;

try {
  app = require('../backend/src/app');
} catch (err) {
  initError = err;
  console.error('Fatal initialization error in /api/index.js:', err);
}

module.exports = (req, res) => {
  if (initError) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'BackendInitializationError',
      message: initError.message,
      stack: initError.stack
    }));
  }
  return app(req, res);
};
