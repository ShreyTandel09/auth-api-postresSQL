const { User, RefreshToken } = require('../models');
const httpStatus = require('http-status');

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
            return {
                success: false,
                message: 'User Already Exist!',
                statusCode: httpStatus.BAD_REQUEST
            };
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
        const verificationToken = await sendEmailVerification(newUser);

        console.log("verificationToken", verificationToken);

        // Format the user data to exclude sensitive information
        return {
            success: true,
            statusCode: httpStatus.CREATED,
            data: {
                id: newUser.id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                isVerified: newUser.isVerified,
                verificationToken
            }
        };

    } catch (error) {
        console.log("Error in registerUser service:", error);
        return {
            success: false,
            message: 'Internal Server Error',
            statusCode: httpStatus.INTERNAL_SERVER_ERROR
        };
    }
};


const verifyUser = async (token) => {
    try {
        if (!token) {
            return {
                success: false,
                message: 'Token is required',
                statusCode: httpStatus.BAD_REQUEST
            };
        }

        // Extract token string if token is an object
        const tokenString = typeof token === 'object' ? token.token : token;

        try {
            // Verify token using the same secret used for signing
            const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

            const user = await User.findOne({
                where: { email: decoded.email }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                    statusCode: httpStatus.NOT_FOUND
                };
            }

            if (user.isVerified) {
                return {
                    success: false,
                    message: 'Email already verified',
                    statusCode: httpStatus.BAD_REQUEST
                };
            }

            // Update user verification status
            await user.update({ isVerified: true });

            return {
                success: true,
                message: 'Email verified successfully',
                statusCode: httpStatus.OK,
                data: {
                    id: user.id,
                    email: user.email,
                    isVerified: true
                }
            };

        } catch (jwtError) {
            return {
                success: false,
                message: 'Invalid verification token',
                statusCode: httpStatus.BAD_REQUEST
            };
        }

    } catch (error) {
        console.error("Error in verifyUser service:", error);
        return {
            success: false,
            message: 'Internal Server Error',
            statusCode: httpStatus.INTERNAL_SERVER_ERROR
        };
    }
};


const resendVerifyUserEmail = async (data) => {
    try {
        const { email } = data;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return {
                success: false,
                message: 'User not found',
                statusCode: httpStatus.NOT_FOUND
            };
        }

        // Check if already verified
        if (user.isVerified) {
            return {
                success: false,
                message: 'Email already verified',
                statusCode: httpStatus.BAD_REQUEST
            };
        }

        // Send verification email
        const verificationToken = await sendEmailVerification(user);

        return {
            success: true,
            message: 'Verification email sent successfully',
            statusCode: httpStatus.OK,
            data: {
                id: user.id,
                email: user.email,
                verificationToken
            }
        };

    } catch (error) {
        console.log("Error in resendVerifyUserEmail service:", error);
        return {
            success: false,
            message: 'Internal Server Error',
            statusCode: httpStatus.INTERNAL_SERVER_ERROR
        };
    }
};

const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ where: { email }, raw: true });

        if (!user) {
            return {
                success: false,
                message: 'User not found',
                statusCode: httpStatus.NOT_FOUND
            };
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return {
                success: false,
                message: 'Invalid Credentials!',
                statusCode: httpStatus.BAD_REQUEST
            };
        }

        if (!user.isVerified) {
            return {
                success: false,
                message: 'Please verify your email!',
                statusCode: httpStatus.BAD_REQUEST
            };
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token
        await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
        });

        // Format user data to exclude sensitive information
        const userData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            isVerified: user.isVerified
        };

        return {
            success: true,
            statusCode: httpStatus.OK,
            data: {
                user: userData,
                token,
                refreshToken
            }
        };

    } catch (error) {
        console.log("Error in loginUser service:", error);
        return {
            success: false,
            message: 'Internal Server Error',
            statusCode: httpStatus.INTERNAL_SERVER_ERROR
        };
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