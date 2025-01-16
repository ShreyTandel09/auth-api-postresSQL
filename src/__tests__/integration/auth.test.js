const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const setupTestDb = require('../helpers/testDb');
const { userOne } = require('../fixtures/user.fixture');

// Use the test database setup helper
setupTestDb();

describe('Auth Endpoints', () => {
    describe('POST /api/v1/auth/register', () => {
        const validUser = {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@yopmail.com',
            password: 'Password123!',
            confirm_password: 'Password123!'
        };

        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            // Check response
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.email).toBe(validUser.email);

            // Verify database entry
            const user = await User.findOne({ where: { email: validUser.email } });
            expect(user).toBeTruthy();
            expect(user.isVerified).toBe(false);
        });

        it('should return error for existing email', async () => {
            // First registration
            await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            // Try to register the same user again
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('User Already Exist!');
        });

        it('should return error for invalid password format', async () => {
            const invalidUser = { ...validUser, password: 'weak', confirm_password: 'weak' };
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toContain('password');
        });

        it('should return error when passwords do not match', async () => {
            const unmatchedUser = {
                ...validUser,
                password: 'Password123!',
                confirm_password: 'DifferentPass123!'
            };
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(unmatchedUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toContain('Passwords must match');
        });
    });
    describe('GET /api/v1/auth/verify-email', () => {
        let verificationToken;

        beforeEach(async () => {
            // Register a new user
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@yopmail.com',
                    password: 'Password123!',
                    confirm_password: 'Password123!'
                });

            // Extract verification token from response
            verificationToken = response.body.data.verificationToken;
            expect(verificationToken).toBeTruthy();
        });

        it('should verify email successfully', async () => {
            const response = await request(app)
                .get(`/api/v1/auth/verify-email?token=${verificationToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.message).toBe('Email verified successfully');

            // Verify user status in database
            const user = await User.findOne({ where: { email: 'john@yopmail.com' } });
            expect(user.isVerified).toBe(true);
        });

        it('should return error for invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/verify-email?token=invalid-token');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('Invalid verification token');
        });

        it('should return error for already verified email', async () => {
            // First verification
            await request(app)
                .get(`/api/v1/auth/verify-email?token=${verificationToken}`);

            // Second verification attempt
            const response = await request(app)
                .get(`/api/v1/auth/verify-email?token=${verificationToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('Email already verified');
        });
    });
    describe('POST /api/v1/auth/resend-verify-email', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@yopmail.com',
                    password: 'Password123!',
                    confirm_password: 'Password123!'
                });
        });

        it('should resend verification email successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/resend-verify-email')
                .send({
                    email: 'john@yopmail.com'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.message).toBe('Verification email sent successfully');
            expect(response.body.data).toHaveProperty('verificationToken');
        });

        it('should return error for non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/resend-verify-email')
                .send({
                    email: 'nonexistent@yopmail.com'
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('User not found');
        });

        it('should return error for already verified email', async () => {
            // First verify the email
            const user = await User.findOne({ where: { email: 'john@yopmail.com' } });
            user.isVerified = true;
            await user.save();

            // Try to resend verification
            const response = await request(app)
                .post('/api/v1/auth/resend-verify-email')
                .send({
                    email: 'john@yopmail.com'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('Email already verified');
        });
    });
    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Create and verify a test user before login tests
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@yopmail.com',
                    password: 'Password123!',
                    confirm_password: 'Password123!'
                });

            // Verify the user
            const verificationToken = response.body.data.verificationToken;
            await request(app)
                .get(`/api/v1/auth/verify-email?token=${verificationToken}`);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@yopmail.com',
                    password: 'Password123!'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user).toHaveProperty('email');
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should return error for unverified user', async () => {
            // Register a new unverified user
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    first_name: 'Jane',
                    last_name: 'Doe',
                    email: 'jane@yopmail.com',
                    password: 'Password123!',
                    confirm_password: 'Password123!'
                });

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'jane@yopmail.com',
                    password: 'Password123!'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('Please verify your email!');
        });

        it('should return error for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@yopmail.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('Invalid Credentials!');
        });

        it('should return error for non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@yopmail.com',
                    password: 'Password123!'
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body.message).toBe('User not found');
        });
    });
}); 