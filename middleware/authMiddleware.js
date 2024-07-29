require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const isAuthenticated = async (req, res, next) => {
    // Get token from the Authorization header
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next(); // Pass control to the next middleware or route handler
    } catch (err) {
        console.error("Error:", err);
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};
module.exports = isAuthenticated;
