const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const logger = require('../../middleware/logger');

const router = express.Router();

// Apply middleware
router.use(logger);

// Define routes
router.use('/auth', authRoute);
router.use('/user', userRoute);

module.exports = router; 