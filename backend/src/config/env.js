const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET must be at least 24 characters long for cryptographic security'),
  JWT_REFRESH_SECRET: z.string().min(24, 'JWT_REFRESH_SECRET must be at least 24 characters long for cryptographic security'),
  COOKIE_SECRET: z.string().min(24, 'COOKIE_SECRET must be at least 24 characters long for cryptographic security'),
  STORAGE_DIR: z.string().default('storage/private-documents')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ CRITICAL CONFIGURATION ERROR: Invalid or missing backend environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  console.error('\nPlease verify backend/.env before starting the application.\n');
  process.exit(1);
}

module.exports = parsed.data;
