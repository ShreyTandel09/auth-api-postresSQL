const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const setupTestDb = require('../helpers/testDb');
const { userOne, password } = require('../fixtures/user.fixture');
const { generateToken } = require('../../utils/jwtToken');
const path = require('path');
const createTestImage = require('../helpers/createTestImage');

// Use the test database setup helper
setupTestDb();

beforeAll(() => {
    createTestImage();
});

describe('User Endpoints', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
        // Create a verified test user
        testUser = await User.create({
            ...userOne,
            isVerified: true
        });

        // Generate auth token for the test user
        authToken = generateToken(testUser);
    });

    describe('GET /api/v1/users/profile', () => {
        it('should get user profile successfully', async () => {
            const response = await request(app)
                .get('/api/v1/users/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                message: 'User profile detail!',
                data: expect.objectContaining({
                    id: testUser.id,
                    first_name: testUser.first_name,
                    last_name: testUser.last_name,
                    email: testUser.email
                })
            });
            // Ensure sensitive data is not returned
            expect(response.body.data).not.toHaveProperty('password');
            expect(response.body.data).not.toHaveProperty('confirm_password');
        });

        it('should return error when no auth token provided', async () => {
            const response = await request(app)
                .get('/api/v1/users/profile');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                message: 'Access denied. No token provided.'
            });
        });
    });

    describe('GET /api/v1/users/all', () => {
        beforeEach(async () => {
            // Create additional test users
            await User.create({
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'jane@yopmail.com',
                password: 'hashedPassword',
                isVerified: true
            });
        });

        it('should get all users successfully', async () => {
            const response = await request(app)
                .get('/api/v1/users/all')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                message: 'All Users!',
                data: {
                    users: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            email: expect.any(String)
                        })
                    ])
                }
            });
        });
    });

    describe('PUT /api/v1/users/update-profile', () => {
        const updateData = {
            first_name: 'John Updated',
            last_name: 'Doe Updated'
        };

        it('should update user profile successfully', async () => {
            const response = await request(app)
                .put('/api/v1/users/update-profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: expect.objectContaining(updateData)
            });
        });
    });

    describe('POST /api/v1/users/upload-profile-picture', () => {
        const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

        it('should upload profile picture successfully', async () => {
            const response = await request(app)
                .post('/api/v1/users/upload-profile-picture')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('profileImage', testImagePath);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: {
                    user_image: expect.stringMatching(/^\/uploads\/.+/),
                    message: 'Profile picture updated successfully'
                }
            });
        });
    });
}); 