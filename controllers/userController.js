const { User } = require('../models');


const getUserProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: 'User Data!!',
            user: req.user
        })
    } catch (error) {
        console.error(error.message);
        return { error: 'Server error' };
    }
}


const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({
            message: 'All Users!!',
            users: users
        })
    } catch (error) {
        console.error(error.message);
        return { error: 'Server error' };
    }
}

module.exports = { getUserProfile };
