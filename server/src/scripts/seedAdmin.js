const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB, disconnectDB, logger } = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      logger.info(`Admin user already exists with email: ${env.ADMIN_EMAIL}`);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        await existingAdmin.save();
        logger.info(`Updated user ${env.ADMIN_EMAIL} to admin role.`);
      }
      await disconnectDB();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

    const admin = await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      phone: env.ADMIN_PHONE,
      role: 'admin',
      isActive: true
    });

    logger.info(`Admin user successfully created!`);
    logger.info(`Email: ${admin.email}`);
    logger.info(`Password: ${env.ADMIN_PASSWORD}`);
    logger.info(`Role: ${admin.role}`);

    await disconnectDB();
  } catch (err) {
    logger.error('Failed to seed admin:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedAdmin().then(() => process.exit(0));
}

module.exports = seedAdmin;
