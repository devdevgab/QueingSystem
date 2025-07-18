// tests/api.test.js
import { jest } from '@jest/globals';
import { testConfig } from './config.js';
import { generateTestResultsTable, logTestResult } from './testReporter.js';

// Mock database functions
await jest.unstable_mockModule('../database.js', () => ({
    getUserIP: jest.fn(),
    verifiyToken: jest.fn(),
    validateUser: jest.fn(),
    createTransaction: jest.fn(),
    createUser: jest.fn(),
    updateTransaction: jest.fn(),
    displayTransactions: jest.fn(),
    displayTellerOneTransactions: jest.fn(),
    deleteTransaction: jest.fn(),
    displayMyTransactions: jest.fn(),
    updateUser: jest.fn(),
    lockIP: jest.fn(),
    updateTransactionStatus: jest.fn(),
    displayTellerTwoTransactions: jest.fn(),
    displayTellerThreeTransactions: jest.fn(),
    displayTellerFourTransactions: jest.fn(),
    createWithdrawalTransaction: jest.fn()
}));

// Mock auth middleware
await jest.unstable_mockModule('../middleware/authMiddleware.js', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { tellerNumber: "3" };
        next();
    }
}));

const request = (await import('supertest')).default;
const app = (await import('../api.js')).default;
const database = await import('../database.js');

let server;
let globalTestResults = [];

beforeAll(() => {
    server = app.listen(0);
    console.log('\n🚀 Starting API Tests...\n');

    // Test the reporter functions
    console.log('>>> Testing reporter functions...');
    const testResult = logTestResult('Test Suite', 'Test Name', 'passed', 100);
    console.log('>>> logTestResult returned:', testResult);
    globalTestResults.push(testResult);
    console.log('>>> After adding test result, length:', globalTestResults.length);
});

afterAll(done => {
    console.log('>>> afterAll starting, testResults length:', globalTestResults.length);
    server.close(() => {
        console.log('>>> Server closed, testResults:', globalTestResults);
        if (globalTestResults.length === 0) {
            console.log('No test results to display');
        } else {
            console.log('>>> Calling generateTestResultsTable with', globalTestResults.length, 'results');
            generateTestResultsTable(globalTestResults);
        }
        if (typeof done === 'function') {
            done();
        }
    });
});

// Global test result collector
afterEach(() => {
    // This will run after each test and collect results
    const currentTest = expect.getState().currentTestName;
    const testSuite = currentTest.split(' › ')[0];
    const testName = currentTest.split(' › ')[1];

    // Add to global results if not already added
    const existingResult = globalTestResults.find(r => r.name === testName && r.suite === testSuite);
    if (!existingResult) {
        globalTestResults.push({
            suite: testSuite,
            name: testName,
            status: 'passed', // Default to passed, will be updated if test fails
            duration: 0
        });
    }
});

describe('Login Endpoint', () => {
    let originalConsoleError;

    beforeEach(() => {
        jest.clearAllMocks();
        originalConsoleError = console.error;
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    test('should successfully login with valid credentials', async () => {
        const startTime = Date.now();

        database.getUserIP.mockReturnValue(testConfig.TEST_IP);
        database.verifiyToken.mockResolvedValue(true);
        database.validateUser.mockImplementation((Username, Password) => {
            if (Username === 'gaby' && Password === '123') {
                return { id: 1, username: 'gaby', name: "gabriel" };
            }
            return null;
        });

        const response = await request(server).post('/login').send({ Username: 'gaby', Password: '123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.message).toBe('Login successful');

        const duration = Date.now() - startTime;
        console.log('>>> About to push test result, current length:', globalTestResults.length);
        globalTestResults.push(logTestResult(
            'Login Endpoint',
            'should successfully login with valid credentials',
            'passed',
            duration
        ));
        console.log('>>> After push, testResults length:', globalTestResults.length);
    });

    test('should fail with invalid credentials', async () => {
        const startTime = Date.now();

        database.getUserIP.mockReturnValue(testConfig.TEST_IP);
        database.verifiyToken.mockResolvedValue(true);
        database.validateUser.mockImplementation(() => null);

        const response = await request(server).post('/login').send({ Username: 'wrong', Password: 'wrong' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'Login Endpoint',
            'should fail with invalid credentials',
            'passed',
            duration
        ));
    });

    test('should fail with invalid token', async () => {
        const startTime = Date.now();

        database.getUserIP.mockReturnValue(testConfig.TEST_IP);
        database.verifiyToken.mockResolvedValue(false);
        database.validateUser.mockImplementation(() => null);

        const response = await request(server).post('/login').send({ Username: 'gaby', Password: '123' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'Login Endpoint',
            'should fail with invalid token',
            'passed',
            duration
        ));
    });

    test('should handle server errors gracefully', async () => {
        const startTime = Date.now();

        console.error = jest.fn();
        database.getUserIP.mockImplementation(() => { throw new Error('fail'); });

        const response = await request(server).post('/login').send({ Username: 'gaby', Password: '123' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(console.error).toHaveBeenCalled();

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'Login Endpoint',
            'should handle server errors gracefully',
            'passed',
            duration
        ));
    });
});

describe('POST /create-transaction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create transaction successfully', async () => {
        const startTime = Date.now();

        const mockTx = { id: 1, AccountNumber: "12345" };
        database.createTransaction.mockResolvedValue(mockTx);

        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: "5000",
                AccountType: "Savings",
                DepositType: "Cash"
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-transaction',
            'should create transaction successfully',
            'passed',
            duration
        ));
    }, 10000);

    test('should fail if required fields are missing', async () => {
        const startTime = Date.now();

        const response = await request(server)
            .post('/create-transaction')
            .send({ Name: "Gabriel" });

        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-transaction',
            'should fail if required fields are missing',
            'passed',
            duration
        ));
    }, 10000);

    test('should fail if Amount is not a valid number', async () => {
        const startTime = Date.now();

        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: "-100",
                AccountType: "Savings",
                DepositType: "Cash"
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Amount must be greater than 0");

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-transaction',
            'should fail if Amount is not a valid number',
            'passed',
            duration
        ));
    }, 10000);

    test('should fail if DepositType is missing for Deposit transaction', async () => {
        const startTime = Date.now();

        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: "1000",
                AccountType: "Savings"
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe("Deposit type is required for deposit transactions");

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-transaction',
            'should fail if DepositType is missing for Deposit transaction',
            'passed',
            duration
        ));
    }, 10000);

    test('should return 500 on server error', async () => {
        const startTime = Date.now();

        console.error = jest.fn();
        database.createTransaction.mockImplementation(() => { throw new Error("fail"); });

        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: "1000",
                AccountType: "Savings",
                DepositType: "Cash"
            });

        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal server error");

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-transaction',
            'should return 500 on server error',
            'passed',
            duration
        ));
    }, 10000);
});

describe('POST /create-user', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create user successfully', async () => {
        const startTime = Date.now();

        const mockUser = {
            id: 1,
            Name: "John",
            LastName: "Doe",
            Username: "johndoe",
            TellerNumber: "1"
        };
        database.createUser.mockResolvedValue(mockUser);

        const response = await request(server)
            .post('/create-user')
            .send({
                Name: "John",
                LastName: "Doe",
                Username: "johndoe",
                Password: "password123",
                TellerNumber: "1"
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('users');

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-user',
            'should create user successfully',
            'passed',
            duration
        ));
    });

    test('should fail if required fields are missing', async () => {
        const startTime = Date.now();

        const response = await request(server).post('/create-user').send({ Name: "John" });

        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-user',
            'should fail if required fields are missing',
            'passed',
            duration
        ));
    });

    test('should return 500 on server error', async () => {
        const startTime = Date.now();

        database.createUser.mockImplementation(() => { throw new Error("fail"); });

        const response = await request(server)
            .post('/create-user')
            .send({
                Name: "John",
                LastName: "Doe",
                Username: "johndoe",
                Password: "password123",
                TellerNumber: "1"
            });

        expect(response.status).toBe(500);
        expect(response.text).toBe("internal server error");

        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult(
            'POST /create-user',
            'should return 500 on server error',
            'passed',
            duration
        ));
    });
});
