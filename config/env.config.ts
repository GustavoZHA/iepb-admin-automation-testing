import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const env = {
  // Service Base URLs
  baseUrl: process.env.BASE_URL || 'http://localhost',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:9002',

  // Database Configuration (Read strictly from .env with generic standard fallbacks, zero hardcoded secrets)
  db: {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },

  // Test Execution Settings
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),

  // Centralized Logging Settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    http: process.env.LOG_HTTP !== 'false',
  },
};
