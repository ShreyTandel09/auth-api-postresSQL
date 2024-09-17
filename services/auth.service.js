const { User, RefreshToken } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailVerification, sendResetEmail } = require('../utils/email');
const { generateToken, generateRefreshToken } = require('../utils/jwtToken');

const ApiError = require('../utils/ApiError');


const registerUser = async (data) => {
    try {

        const { first_name, last_name, email, password } = data;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return { message: 'User Already Exist!', statusCode: 400 };
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
            confirm_password: hashedPassword
        });
        // Send email verification
        sendEmailVerification(newUser);

        return newUser;
    } catch (error) {
        console.log("Error in registerUser service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
};


const verifyUser = async (data) => {
    try {
        const { token } = data;

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decodedToken;

        let user = await User.findOne({ where: { email } });
        if (!user) {
            return { message: 'Invalid or expired token', statusCode: 400 };

        }
        //user is verified here
        user.isVerified = true;
        await user.save();
        return user;

    } catch (error) {
        console.log("Error in VerifyUser service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
}


const resendVerifyUserEmail = async (data) => {
    try {
        const { email } = data;

        let user = await User.findOne({ where: { email } });
        if (!user) {
            return { message: 'User not found', statusCode: 400 };

        }
        sendEmailVerification(user);
        return user;

    } catch (error) {
        console.log("Error in resendVerifyUserEmail service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
}

const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ where: { email }, raw: true }); // Ensure raw: true for plain object

        if (!user) {
            return { message: 'User not found', statusCode: 404 };
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return { message: 'Invalid password!', statusCode: 400 };
        }

        if (!user.isVerified) {
            return { message: 'Please verify your email!', statusCode: 400 };
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token
        await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
        });

        // Return plain data with statusCode for success
        return {
            user,
            token,
            refreshToken,
        };
    } catch (error) {
        console.log("Error in loginUser service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
};


const refreshTokenService = async (data) => {
    try {

        const { refreshToken } = data;
        if (!refreshToken) {
            return { message: 'Refresh token is required', statusCode: 401 };
        }

        const refreshTokenData = await RefreshToken.findOne({ token: refreshToken });
        if (!refreshTokenData) {
            return { message: 'Invalid refresh token', statusCode: 401 };
        }

        const user = await User.findByPk(refreshTokenData.userId);
        if (!user) {
            return { message: 'User not found', statusCode: 404 };
        }
        const newAccessToken = generateToken(user);

        const resData = {
            user,
            token: newAccessToken,
            refreshToken: refreshToken
        }
        return resData;
    } catch (error) {
        console.log("Error in VerifyUser service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
}


const forgotPasswordService = async (data) => {
    try {
        const { email } = data;
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return { message: 'User not found', statusCode: 400 };

        }
        sendResetEmail(user)
        return user;

    } catch (error) {
        console.log("Error in forgotPasswordService service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
}

const resetPasswordService = async (data) => {
    try {
        // const { token, newPassword } = data;

        const { token } = data.query
        const { password } = data.body

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decodedToken;

        console.log(email);

        let user = await User.findOne({ where: { email } });
        if (!user) {
            return { message: 'Invalid or expired token', statusCode: 400 };

        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        user.confirm_password = hashedPassword;
        await user.save();
        return user;

    } catch (error) {
        console.log("Error in resetPasswordService service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
}


module.exports = {
    loginUser,
    verifyUser,
    resendVerifyUserEmail,
    registerUser,
    refreshTokenService,
    forgotPasswordService,
    resetPasswordService
};
