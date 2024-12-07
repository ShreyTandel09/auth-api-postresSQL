require('dotenv').config({ path: '.env.test' });

// Increase timeout for all tests
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
    // Add any cleanup code here
}); 