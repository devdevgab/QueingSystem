// jest.config.js
export default {
    testEnvironment: 'node',

    // Enable ESM compatibility
    transform: {},

    // Match all test files
    testMatch: ['**/tests/**/*.test.js'],

    // Optional: map relative imports without .js extensions to work around Jest ESM resolution bugs
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },

    // Run this file before all tests (can be used to set up globals/mocks)
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Mocks and logging
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,

    // Prevent hanging processes
    forceExit: true,

    // Prevent some issues with ESM modules not being transformed
    transformIgnorePatterns: [],

    // File extensions Jest should look at
    moduleFileExtensions: ['js', 'json'],

    // Optional: More verbose output
    verbose: true
};
