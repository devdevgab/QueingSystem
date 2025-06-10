import { jest } from '@jest/globals';
import { testConfig } from './config.js';

// Set test environment variables
Object.entries(testConfig).forEach(([key, value]) => {
    process.env[key] = value;
});

// Global test setup
global.beforeAll = (fn) => {
    fn();
};

// Global test teardown
global.afterAll = (fn) => {
    fn();
};

// Reset all mocks before each test
global.beforeEach = (fn) => {
    fn();
    jest.clearAllMocks();
}; 