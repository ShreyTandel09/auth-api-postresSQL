module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/docs/**',
        '!src/database/migrations/**',
        '!src/database/seeders/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    verbose: true,
    silent: true

}; 