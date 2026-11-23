const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost-and-found',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-for-ai-lost-found-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  MATCH_THRESHOLD: parseFloat(process.env.MATCH_THRESHOLD || '0.75'),
  POSSIBLE_MATCH_THRESHOLD: parseFloat(process.env.POSSIBLE_MATCH_THRESHOLD || '0.60'),
  WEIGHT_TEXT: parseFloat(process.env.WEIGHT_TEXT || '0.50'),
  WEIGHT_IMAGE: parseFloat(process.env.WEIGHT_IMAGE || '0.50'),
  FEATURE_EMAIL_NOTIFICATIONS: process.env.FEATURE_EMAIL_NOTIFICATIONS === 'true',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@lostfound.local',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPass123!',
  ADMIN_NAME: process.env.ADMIN_NAME || 'System Administrator',
  ADMIN_PHONE: process.env.ADMIN_PHONE || '+1-555-0199'
};
