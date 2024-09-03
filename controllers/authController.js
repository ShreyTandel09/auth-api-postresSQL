const { User, RefreshToken } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateUser, validateLoginUser } = require('../validation/userValidation');
const { sendEmailVerification, sendRestEmail } = require('../service/email');
const { generateToken, generateRefreshToken } = require('../utils/jwtToken');


const register = async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { first_name, last_name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with the hashed password
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword
        });

        // Send email verification
        await sendEmailVerification(newUser);

        // Send a success response
        res.status(201).json({
            message: 'User registration successful',
            user: {
                id: newUser.id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.isVerified
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};


const verifyEmail = async (req, res) => {
    const { token } = req.query;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decodedToken;

    try {
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        //user is verified here
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password!' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ error: 'Please verify your email!' });
        }

        //token and refresh token
        const token = generateToken(user)
        const refreshToken = generateRefreshToken(user)

        // Create a new user with the hashed password
        await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
        });

        res.status(200).json({
            message: 'User login successful',
            user: user,
            token: token,
            refreshToken: refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};


const refreshToken = async (req, res) => {

    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token is required' });
        }

        const refreshTokenData = await RefreshToken.findOne({ token: refreshToken });
        if (!refreshTokenData) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const user = await User.findByPk(refreshTokenData.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const newAccessToken = generateToken(user);
        // res.status(200).json({ token: newAccessToken });

        res.status(200).json({
            message: 'New token Generated',
            user: user,
            token: newAccessToken,
            refreshToken: refreshToken
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }

};


const forgotPassword = async (req, res) => {
    try {
        console.log(req.body);
        const { email } = req.body;
        if (!email) {
            return res.status(401).json({ error: 'Email is Required' });
        }
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'User with Email ID does not exist!!' });
        }

        //Forget password Email
        sendRestEmail(user)
        res.status(201).json({
            message: 'Password reset email sent',
        });
    } catch (error) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }

}

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decodedToken;

        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error.message);
        if (error.message = 'jwt expired') {
            res.status(500).json({ error: 'Token Expired!!' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
}


module.exports = { register, login, verifyEmail, refreshToken, forgotPassword, resetPassword };
