const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  FRONTEND_URL: z.string().default('https://jm-business-hub.vercel.app'),
  DATABASE_URL: z.string().default('postgresql://neondb_owner:npg_UjFrdGRB7Tv4@ep-jolly-lab-b4if0692.c-6.us-east-2.aws.neon.tech/jm_business_hub?sslmode=require'),
  JWT_SECRET: z.string().default('jm_hub_jwt_secret_dev_32_bytes_super_secure_key_2026!'),
  JWT_REFRESH_SECRET: z.string().default('jm_hub_jwt_refresh_secret_dev_32_bytes_secure_key_2026!'),
  COOKIE_SECRET: z.string().default('jm_hub_cookie_secret_dev_32_bytes_secure_key_2026!'),
  STORAGE_DIR: z.string().default('storage/private-documents')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Environment variable validation warnings:', parsed.error.format());
}

module.exports = parsed.success ? parsed.data : {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'production',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://jm-business-hub.vercel.app',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_UjFrdGRB7Tv4@ep-jolly-lab-b4if0692.c-6.us-east-2.aws.neon.tech/jm_business_hub?sslmode=require',
  JWT_SECRET: process.env.JWT_SECRET || 'jm_hub_jwt_secret_dev_32_bytes_super_secure_key_2026!',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'jm_hub_jwt_refresh_secret_dev_32_bytes_secure_key_2026!',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'jm_hub_cookie_secret_dev_32_bytes_secure_key_2026!',
  STORAGE_DIR: process.env.STORAGE_DIR || 'storage/private-documents'
};
