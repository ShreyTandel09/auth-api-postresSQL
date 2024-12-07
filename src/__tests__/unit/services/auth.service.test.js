const { User, RefreshToken } = require('../../../models');
const authService = require('../../../services/auth.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

// Mock the dependencies
jest.mock('../../../models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../utils/email');
jest.mock('../../../utils/jwtToken');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        const mockUserData = {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@yopmail.com',
            password: 'Password123!'
        };

        it('should successfully register a new user', async () => {
            // Mock bcrypt hash
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');

            // Mock User.findOne to return null (user doesn't exist)
            User.findOne.mockResolvedValue(null);

            // Mock User.create
            const mockCreatedUser = {
                id: 1,
                first_name: mockUserData.first_name,
                last_name: mockUserData.last_name,
                email: mockUserData.email,
                password: 'hashedPassword',
                isVerified: false
            };
            User.create.mockResolvedValue(mockCreatedUser);

            // Mock email verification token
            const mockVerificationToken = 'mock-verification-token';
            jest.spyOn(require('../../../utils/email'), 'sendEmailVerification')
                .mockResolvedValue(mockVerificationToken);

            const result = await authService.registerUser(mockUserData);

            expect(result).toEqual({
                success: true,
                statusCode: httpStatus.CREATED,
                data: {
                    id: mockCreatedUser.id,
                    first_name: mockCreatedUser.first_name,
                    last_name: mockCreatedUser.last_name,
                    email: mockCreatedUser.email,
                    isVerified: mockCreatedUser.isVerified,
                    verificationToken: mockVerificationToken
                }
            });
        });

        it('should return error if user already exists', async () => {
            User.findOne.mockResolvedValue({ id: 1, email: mockUserData.email });

            const result = await authService.registerUser(mockUserData);

            expect(result).toEqual({
                success: false,
                message: 'User Already Exist!',
                statusCode: httpStatus.BAD_REQUEST
            });
        });

        it('should return error on internal server error', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const result = await authService.registerUser(mockUserData);

            expect(result).toEqual({
                success: false,
                message: 'Internal Server Error',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR
            });
        });
    });

    describe('loginUser', () => {
        const mockCredentials = {
            email: 'john@yopmail.com',
            password: 'Password123!'
        };

        it('should successfully login a verified user', async () => {
            const mockUser = {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: mockCredentials.email,
                password: 'hashedPassword',
                isVerified: true
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            // Mock token generation
            const mockToken = 'mock-access-token';
            const mockRefreshToken = 'mock-refresh-token';
            jest.spyOn(require('../../../utils/jwtToken'), 'generateToken')
                .mockReturnValue(mockToken);
            jest.spyOn(require('../../../utils/jwtToken'), 'generateRefreshToken')
                .mockReturnValue(mockRefreshToken);

            // Mock refresh token creation
            RefreshToken.create.mockResolvedValue({ token: mockRefreshToken });

            const result = await authService.loginUser(
                mockCredentials.email,
                mockCredentials.password
            );

            expect(result).toEqual({
                success: true,
                statusCode: httpStatus.OK,
                data: {
                    user: {
                        id: mockUser.id,
                        first_name: mockUser.first_name,
                        last_name: mockUser.last_name,
                        email: mockUser.email,
                        isVerified: mockUser.isVerified
                    },
                    token: mockToken,
                    refreshToken: mockRefreshToken
                }
            });
        });

        it('should return error for non-existent user', async () => {
            User.findOne.mockResolvedValue(null);

            const result = await authService.loginUser(
                mockCredentials.email,
                mockCredentials.password
            );

            expect(result).toEqual({
                success: false,
                message: 'User not found',
                statusCode: httpStatus.NOT_FOUND
            });
        });

        it('should return error for invalid password', async () => {
            const mockUser = {
                id: 1,
                email: mockCredentials.email,
                password: 'hashedPassword',
                isVerified: true
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            const result = await authService.loginUser(
                mockCredentials.email,
                mockCredentials.password
            );

            expect(result).toEqual({
                success: false,
                message: 'Invalid Credentials!',
                statusCode: httpStatus.BAD_REQUEST
            });
        });

        it('should return error for unverified user', async () => {
            const mockUser = {
                id: 1,
                email: mockCredentials.email,
                password: 'hashedPassword',
                isVerified: false
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const result = await authService.loginUser(
                mockCredentials.email,
                mockCredentials.password
            );

            expect(result).toEqual({
                success: false,
                message: 'Please verify your email!',
                statusCode: httpStatus.BAD_REQUEST
            });
        });

        it('should return error on internal server error', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const result = await authService.loginUser(
                mockCredentials.email,
                mockCredentials.password
            );

            expect(result).toEqual({
                success: false,
                message: 'Internal Server Error',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR
            });
        });
    });
}); 
