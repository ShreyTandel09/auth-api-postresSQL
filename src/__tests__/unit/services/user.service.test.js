const { User } = require('../../../models');
const userService = require('../../../services/user.service');
const httpStatus = require('http-status');

// Mock the models
jest.mock('../../../models');

describe('User Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCurrentUser', () => {
        const mockUserId = 1;
        const mockUserData = {
            user: { id: mockUserId }
        };

        it('should return current user successfully', async () => {
            const mockUser = {
                id: mockUserId,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@yopmail.com',
                isVerified: true
            };

            User.findByPk.mockResolvedValue(mockUser);

            const result = await userService.getCurrentUser(mockUserData);

            expect(result).toEqual({
                message: "Operation successful",
                statusCode: 200,
                success: true,
                data: mockUser
            });
            expect(User.findByPk).toHaveBeenCalledWith(mockUserId, {
                attributes: { exclude: ['password', 'confirm_password'] }
            });
        });

        it('should return not found response when user does not exist', async () => {
            User.findByPk.mockResolvedValue(null);

            const result = await userService.getCurrentUser(mockUserData);

            expect(result).toEqual({
                success: false,
                message: 'User not found',
                statusCode: httpStatus.NOT_FOUND
            });
        });

        it('should handle service error', async () => {
            const error = new Error('Database error');
            User.findByPk.mockRejectedValue(error);

            const result = await userService.getCurrentUser(mockUserData);

            expect(result).toEqual({
                success: false,
                message: 'Internal Server Error',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR
            });
        });
    });

    describe('getAllUsers', () => {
        it('should return all users successfully', async () => {
            const mockUsers = [
                {
                    id: 1,
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@yopmail.com'
                },
                {
                    id: 2,
                    first_name: 'Jane',
                    last_name: 'Doe',
                    email: 'jane@yopmail.com'
                }
            ];

            User.findAll.mockResolvedValue(mockUsers);

            const result = await userService.getAllUsers();

            expect(result).toEqual({
                message: "Operation successful",
                statusCode: 200,
                success: true,
                data: { users: mockUsers }
            });
            expect(User.findAll).toHaveBeenCalledWith({
                attributes: { exclude: ['password', 'confirm_password'] },
                order: [['createdAt', 'DESC']]
            });
        });

        it('should handle service error', async () => {
            const error = new Error('Database error');
            User.findAll.mockRejectedValue(error);

            const result = await userService.getAllUsers();

            expect(result).toEqual({
                success: false,
                message: 'Internal Server Error',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR
            });
        });
    });

    describe('updateUser', () => {
        const mockUserId = 1;
        const mockUpdateData = {
            first_name: 'John Updated',
            last_name: 'Doe Updated',
            password: 'shouldnotupdate',
            confirm_password: 'shouldnotupdate'
        };

        it('should update user successfully', async () => {
            const mockUser = {
                id: mockUserId,
                first_name: 'John',
                last_name: 'Doe',
                update: jest.fn()
            };

            const updatedUser = {
                ...mockUser,
                first_name: mockUpdateData.first_name,
                last_name: mockUpdateData.last_name
            };

            User.findByPk.mockResolvedValueOnce(mockUser);
            mockUser.update.mockResolvedValue(updatedUser);
            User.findByPk.mockResolvedValueOnce(updatedUser);

            const result = await userService.updateUser(mockUserId, mockUpdateData);

            expect(result).toEqual({
                message: "Operation successful",
                statusCode: 200,
                success: true,
                data: updatedUser
            });
            expect(mockUser.update).toHaveBeenCalledWith({
                first_name: mockUpdateData.first_name,
                last_name: mockUpdateData.last_name
            });
            // Verify sensitive data was not included
            expect(mockUser.update).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    password: expect.any(String),
                    confirm_password: expect.any(String)
                })
            );
        });

        it('should return not found response when user does not exist', async () => {
            User.findByPk.mockResolvedValue(null);

            const result = await userService.updateUser(mockUserId, mockUpdateData);

            expect(result).toEqual({
                success: false,
                message: 'User not found',
                statusCode: httpStatus.NOT_FOUND
            });
        });

        it('should handle service error', async () => {
            const error = new Error('Database error');
            User.findByPk.mockRejectedValue(error);

            const result = await userService.updateUser(mockUserId, mockUpdateData);

            expect(result).toEqual({
                success: false,
                message: 'Internal Server Error',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR
            });
        });
    });

    describe('uploadProfilePicture', () => {
        const mockUserId = 1;
        const mockFile = {
            filename: 'profile-picture.jpg'
        };

        it('should upload profile picture successfully', async () => {
            const mockUser = {
                id: mockUserId,
                save: jest.fn()
            };

            User.findByPk.mockResolvedValue(mockUser);
            mockUser.save.mockResolvedValue(mockUser);

            const result = await userService.uploadProfilePicture(mockUserId, mockFile);

            expect(result).toEqual({
                message: "Operation successful",
                statusCode: 200,
                success: true,
                data: {
                    user_image: `/uploads/${mockFile.filename}`,
                    message: 'Profile picture updated successfully'
                }
            });
            expect(mockUser.user_image).toBe(`/uploads/${mockFile.filename}`);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should return error when no file is provided', async () => {
            const result = await userService.uploadProfilePicture(mockUserId, null);

            expect(result).toEqual({
                success: false,
                message: 'No file uploaded',
                statusCode: httpStatus.BAD_REQUEST
            });
        });

        it('should return not found response when user does not exist', async () => {
            User.findByPk.mockResolvedValue(null);

            const result = await userService.uploadProfilePicture(mockUserId, mockFile);

            expect(result).toEqual({
                success: false,
                message: 'User not found',
                statusCode: httpStatus.NOT_FOUND
            });
        });

        it('should handle service error', async () => {
            const error = new Error('Database error');
            User.findByPk.mockRejectedValue(error);

            const result = await userService.uploadProfilePicture(mockUserId, mockFile);

            expect(result).toEqual({
                success: false,
                message: 'Internal Server Error',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR
            });
        });
    });
}); 