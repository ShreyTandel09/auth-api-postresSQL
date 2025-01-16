const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');

const router = express.Router();

// Define routes
router.use('/auth', authRoute);
router.use('/user', userRoute);

module.exports = router;