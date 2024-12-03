require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const isAuthenticated = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
        logger.debug('User authenticated', { userId });

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        logger.error('Authentication error', { error: err });
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};
module.exports = isAuthenticated;
