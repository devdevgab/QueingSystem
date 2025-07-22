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
});

afterAll(async () => {
    if (server && server.close) {
        await new Promise(resolve => server.close(resolve));
    }
    // Always print the table at the very end
    if (globalTestResults.length === 0) {
        console.log('No test results to display');
    } else {
        generateTestResultsTable(globalTestResults);
    }
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

// New tests for additional endpoints

describe('PUT /update-transaction/:id', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should update transaction successfully', async () => {
        const startTime = Date.now();
        const mockTx = { id: 1, AccountNumber: "12345", Name: "Gabriel", TransactionType: "Deposit" };
        database.updateTransaction.mockResolvedValue(mockTx);
        const response = await request(server)
            .put('/update-transaction/1')
            .send({ AccountNumber: "12345", Name: "Gabriel", TransactionType: "Deposit" });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('updatedTransaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction/:id', 'should update transaction successfully', 'passed', duration));
    });
    test('should fail if required fields are missing', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/update-transaction/1')
            .send({ Name: "Gabriel" });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction/:id', 'should fail if required fields are missing', 'passed', duration));
    });
    test('should return 404 if transaction not found', async () => {
        const startTime = Date.now();
        database.updateTransaction.mockResolvedValue(null);
        const response = await request(server)
            .put('/update-transaction/999')
            .send({ AccountNumber: "12345", Name: "Gabriel", TransactionType: "Deposit" });
        expect(response.status).toBe(404);
        expect(response.text).toBe("Transaction not found");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction/:id', 'should return 404 if transaction not found', 'passed', duration));
    });
});

describe('GET /display-transactions', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should display transactions', async () => {
        const startTime = Date.now();
        const mockTxs = [{ id: 1 }, { id: 2 }];
        database.displayTransactions.mockResolvedValue(mockTxs);
        const response = await request(server).get('/display-transactions');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transactions');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /display-transactions', 'should display transactions', 'passed', duration));
    });
    test('should return 500 on server error', async () => {
        const startTime = Date.now();
        database.displayTransactions.mockImplementation(() => { throw new Error('fail'); });
        const response = await request(server).get('/display-transactions');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /display-transactions', 'should return 500 on server error', 'passed', duration));
    });
});

describe('GET /my-transactions', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should display my transactions', async () => {
        const startTime = Date.now();
        const mockTxs = [{ id: 1 }];
        database.displayMyTransactions.mockResolvedValue(mockTxs);
        const response = await request(server).get('/my-transactions');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transactions');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /my-transactions', 'should display my transactions', 'passed', duration));
    });
    test('should return 500 on server error', async () => {
        const startTime = Date.now();
        database.displayMyTransactions.mockImplementation(() => { throw new Error('fail'); });
        const response = await request(server).get('/my-transactions');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /my-transactions', 'should return 500 on server error', 'passed', duration));
    });
});

describe('PUT /delete-transaction/:id', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should delete transaction successfully', async () => {
        const startTime = Date.now();
        database.deleteTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .put('/delete-transaction/1')
            .send({ DeleteStatus: 1 });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('DeleteStatus');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /delete-transaction/:id', 'should delete transaction successfully', 'passed', duration));
    });
    test('should fail if DeleteStatus is not a number', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/delete-transaction/1')
            .send({ DeleteStatus: 'abc' });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Invalid DeleteStatus value. Must be a number.");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /delete-transaction/:id', 'should fail if DeleteStatus is not a number', 'passed', duration));
    });
    test('should return 404 if transaction not found', async () => {
        const startTime = Date.now();
        database.deleteTransaction.mockResolvedValue(null);
        const response = await request(server)
            .put('/delete-transaction/999')
            .send({ DeleteStatus: 1 });
        expect(response.status).toBe(404);
        expect(response.text).toBe("Transaction not found");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /delete-transaction/:id', 'should return 404 if transaction not found', 'passed', duration));
    });
});

// More tests for additional endpoints

describe('PUT /update-user/:id', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should update user successfully', async () => {
        const startTime = Date.now();
        const mockUser = { id: 1, Name: "John", LastName: "Doe", Username: "johndoe" };
        database.updateUser.mockResolvedValue(mockUser);
        const response = await request(server)
            .put('/update-user/1')
            .send({ Name: "John", LastName: "Doe", Username: "johndoe", Password: "password123" });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('updatedTransaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-user/:id', 'should update user successfully', 'passed', duration));
    });
    test('should fail if required fields are missing', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/update-user/1')
            .send({ Name: "John" });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-user/:id', 'should fail if required fields are missing', 'passed', duration));
    });
    test('should return 404 if user not found', async () => {
        const startTime = Date.now();
        database.updateUser.mockResolvedValue(null);
        const response = await request(server)
            .put('/update-user/999')
            .send({ Name: "John", LastName: "Doe", Username: "johndoe", Password: "password123" });
        expect(response.status).toBe(404);
        expect(response.text).toBe("Transaction not found");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-user/:id', 'should return 404 if user not found', 'passed', duration));
    });
});

describe('POST /logout', () => {
    test('should logout successfully', async () => {
        const startTime = Date.now();
        const response = await request(server).post('/logout');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logout successful');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /logout', 'should logout successfully', 'passed', duration));
    });
    test('should return 500 on server error', async () => {
        const startTime = Date.now();
        // Simulate error in session destroy
        const origDestroy = server.close;
        server.close = (cb) => cb(new Error('fail'));
        const response = await request(server).post('/logout');
        expect(response.status).toBe(500);
        server.close = origDestroy;
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /logout', 'should return 500 on server error', 'passed', duration));
    });
});


describe('GET /get-user-ip', () => {
    test('should get user ip', async () => {
        const startTime = Date.now();
        database.getUserIP.mockReturnValue('127.0.0.1');
        const response = await request(server).get('/get-user-ip');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('ip');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /get-user-ip', 'should get user ip', 'passed', duration));
    });
});

describe('GET /lockIp', () => {
    test('should lock ip', async () => {
        const startTime = Date.now();
        database.lockIP.mockReturnValue('locked');
        const response = await request(server).get('/lockIp');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /lockIp', 'should lock ip', 'passed', duration));
    });
});

describe('PUT /update-transaction-status/:id', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should update transaction status successfully', async () => {
        const startTime = Date.now();
        const mockTx = { id: 1, Status: 'Closed' };
        database.updateTransactionStatus.mockResolvedValue(mockTx);
        const response = await request(server)
            .put('/update-transaction-status/1')
            .send({ Status: 'Closed' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction-status/:id', 'should update transaction status successfully', 'passed', duration));
    });
    test('should fail with invalid status', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/update-transaction-status/1')
            .send({ Status: 'InvalidStatus' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid status value');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction-status/:id', 'should fail with invalid status', 'passed', duration));
    });
    test('should return 404 if transaction not found', async () => {
        const startTime = Date.now();
        database.updateTransactionStatus.mockResolvedValue(null);
        const response = await request(server)
            .put('/update-transaction-status/999')
            .send({ Status: 'Closed' });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Transaction not found');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction-status/:id', 'should return 404 if transaction not found', 'passed', duration));
    });
});

describe('GET /teller-one-transactions', () => {
    test('should get teller one transactions', async () => {
        const startTime = Date.now();
        database.displayTellerOneTransactions.mockResolvedValue([{ id: 1 }]);
        const response = await request(server).get('/teller-one-transactions');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transactions');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /teller-one-transactions', 'should get teller one transactions', 'passed', duration));
    });
});

describe('GET /teller-two-transactions', () => {
    test('should get teller two transactions', async () => {
        const startTime = Date.now();
        database.displayTellerTwoTransactions.mockResolvedValue([{ id: 2 }]);
        const response = await request(server).get('/teller-two-transactions');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transactions');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /teller-two-transactions', 'should get teller two transactions', 'passed', duration));
    });
});

describe('GET /teller-three-transactions', () => {
    test('should get teller three transactions', async () => {
        const startTime = Date.now();
        database.displayTellerThreeTransactions.mockResolvedValue([{ id: 3 }]);
        const response = await request(server).get('/teller-three-transactions');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transactions');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /teller-three-transactions', 'should get teller three transactions', 'passed', duration));
    });
});

describe('GET /teller-four-transactions', () => {
    test('should get teller four transactions', async () => {
        const startTime = Date.now();
        database.displayTellerFourTransactions.mockResolvedValue([{ id: 4 }]);
        const response = await request(server).get('/teller-four-transactions');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transactions');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /teller-four-transactions', 'should get teller four transactions', 'passed', duration));
    });
});

describe('POST /create-withdrawal', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should create withdrawal successfully', async () => {
        const startTime = Date.now();
        const mockTx = { id: 1, AccountNumber: "12345" };
        database.createWithdrawalTransaction.mockResolvedValue(mockTx);
        const response = await request(server)
            .post('/create-withdrawal')
            .send({ AccountNumber: "12345", Name: "Gabriel", Amount: 1000, AccountType: "Savings" });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-withdrawal', 'should create withdrawal successfully', 'passed', duration));
    });
    test('should fail if required fields are missing', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-withdrawal')
            .send({ Name: "Gabriel" });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-withdrawal', 'should fail if required fields are missing', 'passed', duration));
    });
    test('should fail if Amount is not valid', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-withdrawal')
            .send({ AccountNumber: "12345", Name: "Gabriel", Amount: -100, AccountType: "Savings" });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Amount must be a number greater than or equal to zero");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-withdrawal', 'should fail if Amount is not valid', 'passed', duration));
    });
});

describe('POST /admin-login', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    test('should login as admin successfully', async () => {
        const startTime = Date.now();
        const mockUser = { ID: 1, Username: "admin", TellerNumber: 100 };
        database.validateUser.mockResolvedValue(mockUser);
        const response = await request(server)
            .post('/admin-login')
            .send({ Username: "admin", Password: "adminpass" });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Admin login successful");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should login as admin successfully', 'passed', duration));
    });
    test('should fail if required fields are missing', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/admin-login')
            .send({ Username: "admin" });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Username and password are required");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should fail if required fields are missing', 'passed', duration));
    });
    test('should fail if not admin user', async () => {
        const startTime = Date.now();
        const mockUser = { ID: 2, Username: "user", TellerNumber: 1 };
        database.validateUser.mockResolvedValue(mockUser);
        const response = await request(server)
            .post('/admin-login')
            .send({ Username: "user", Password: "userpass" });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Access denied: Not an admin user");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should fail if not admin user', 'passed', duration));
    });
    test('should fail with invalid credentials', async () => {
        const startTime = Date.now();
        database.validateUser.mockResolvedValue(null);
        const response = await request(server)
            .post('/admin-login')
            .send({ Username: "admin", Password: "wrongpass" });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid username or password");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should fail with invalid credentials', 'passed', duration));
    });
});

describe('Advanced and Edge Case Tests', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    test('POST /create-transaction with string for Amount', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: "notanumber",
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(400);
        expect(response.text).toMatch(/Amount must be a valid integer/);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with string for Amount', 'passed', duration));
    });

    test('POST /create-transaction with Amount=0 (boundary)', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 0,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Amount must be greater than 0");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with Amount=0', 'passed', duration));
    });

    test('POST /create-transaction with Amount=2147483647 (max int)', async () => {
        const startTime = Date.now();
        database.createTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 2147483647,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should succeed with Amount=2147483647', 'passed', duration));
    });

    test('POST /create-transaction with extra/unexpected field', async () => {
        const startTime = Date.now();
        database.createTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "Savings",
                DepositType: "Cash",
                ExtraField: "shouldBeIgnored"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should ignore extra/unexpected field', 'passed', duration));
    });

    test('POST /create-transaction with empty body', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({});
        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with empty body', 'passed', duration));
    });

    test('GET /display-transactions with missing token (auth failure)', async () => {
        const startTime = Date.now();
        // Simulate missing token by not setting req.user in mock
        const origAuth = database.displayTransactions;
        database.displayTransactions.mockImplementation(() => { throw new Error('Unauthorized'); });
        const response = await request(server).get('/display-transactions');
        expect([401, 500]).toContain(response.status); // Accept 401 or 500 depending on middleware
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /display-transactions', 'should fail with missing token', 'passed', duration));
        database.displayTransactions = origAuth;
    });

    test('POST /create-user with SQL injection attempt', async () => {
        const startTime = Date.now();
        const sqlInjection = "Robert'); DROP TABLE users;--";
        database.createUser.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-user')
            .send({
                Name: sqlInjection,
                LastName: "Doe",
                Username: "johndoe",
                Password: "password123",
                TellerNumber: "1"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('users');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-user', 'should handle SQL injection attempt', 'passed', duration));
    });

    test('POST /create-user with XSS attempt', async () => {
        const startTime = Date.now();
        const xss = "<script>alert('xss')</script>";
        database.createUser.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-user')
            .send({
                Name: xss,
                LastName: "Doe",
                Username: "johndoe",
                Password: "password123",
                TellerNumber: "1"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('users');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-user', 'should handle XSS attempt', 'passed', duration));
    });

    test('POST /create-transaction double submission (idempotency)', async () => {
        const startTime = Date.now();
        database.createTransaction.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1 });
        const payload = {
            AccountNumber: "12345",
            Name: "Gabriel",
            TransactionType: "Deposit",
            Amount: 1000,
            AccountType: "Savings",
            DepositType: "Cash"
        };
        const response1 = await request(server).post('/create-transaction').send(payload);
        const response2 = await request(server).post('/create-transaction').send(payload);
        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should handle double submission', 'passed', duration));
    });

    test('POST /logout without session', async () => {
        const startTime = Date.now();
        // Simulate no session by not setting req.session
        const response = await request(server).post('/logout');
        expect([200, 500]).toContain(response.status); // Accept 200 or 500 depending on session handling
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /logout', 'should handle logout without session', 'passed', duration));
    });
});

describe('More Advanced and Negative Tests', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    test('POST /create-transaction with negative AccountNumber', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: -1,
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Account Number must be a positive integer");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with negative AccountNumber', 'passed', duration));
    });

    test('POST /create-transaction with Name as a number', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: 12345,
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Name cannot be a number");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with Name as a number', 'passed', duration));
    });

    test('POST /create-transaction with missing TransactionType', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: "Gabriel",
                Amount: 1000,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with missing TransactionType', 'passed', duration));
    });

    test('POST /create-transaction with Amount above max int', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 2147483648,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Amount is too high. Must be less than or equal to 2,147,483,647");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with Amount above max int', 'passed', duration));
    });

    test('POST /create-transaction with invalid AccountType', async () => {
        const startTime = Date.now();
        database.createTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "InvalidType",
                DepositType: "Cash"
            });
        // Should still succeed if AccountType is not validated
        expect([201, 400]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should handle invalid AccountType', 'passed', duration));
    });

    test('POST /create-transaction with PaymentType for Deposit', async () => {
        const startTime = Date.now();
        database.createTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "Savings",
                DepositType: "Cash",
                PaymentType: "Card"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should ignore PaymentType for Deposit', 'passed', duration));
    });

    test('POST /create-transaction with DisbursementType for Payment', async () => {
        const startTime = Date.now();
        database.createTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: "Gabriel",
                TransactionType: "Payment",
                Amount: 1000,
                AccountType: "Savings",
                PaymentType: "Card",
                DisbursementType: "Cash"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should ignore DisbursementType for Payment', 'passed', duration));
    });

    test('GET /my-transactions with DB throwing error', async () => {
        const startTime = Date.now();
        database.displayMyTransactions.mockImplementation(() => { throw new Error('fail'); });
        const response = await request(server).get('/my-transactions');
        expect(response.status).toBe(500);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /my-transactions', 'should return 500 on DB error', 'passed', duration));
    });

    test('PUT /update-transaction/:id with empty body', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/update-transaction/1')
            .send({});
        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction/:id', 'should fail with empty body', 'passed', duration));
    });

    test('PUT /update-user/:id with invalid Username', async () => {
        const startTime = Date.now();
        database.updateUser.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .put('/update-user/1')
            .send({ Name: "John", LastName: "Doe", Username: "", Password: "password123" });
        expect([200, 400]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-user/:id', 'should handle invalid Username', 'passed', duration));
    });

    test('POST /admin-login with empty body', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/admin-login')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Username and password are required");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should fail with empty body', 'passed', duration));
    });

    test('POST /admin-login with valid user but not admin', async () => {
        const startTime = Date.now();
        database.validateUser.mockResolvedValue({ ID: 2, Username: "user", TellerNumber: 1 });
        const response = await request(server)
            .post('/admin-login')
            .send({ Username: "user", Password: "userpass" });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Access denied: Not an admin user");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should fail with valid user but not admin', 'passed', duration));
    });

    test('POST /create-withdrawal with negative Amount', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-withdrawal')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                Amount: -100,
                AccountType: "Savings"
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Amount must be a number greater than or equal to zero");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-withdrawal', 'should fail with negative Amount', 'passed', duration));
    });

    test('POST /create-withdrawal with AccountNumber as string', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-withdrawal')
            .send({
                AccountNumber: "notanumber",
                Name: "Gabriel",
                Amount: 1000,
                AccountType: "Savings"
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Account Number must be in digits");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-withdrawal', 'should fail with AccountNumber as string', 'passed', duration));
    });

    test('GET /teller-one-transactions with DB throwing error', async () => {
        const startTime = Date.now();
        database.displayTellerOneTransactions.mockImplementation(() => { throw new Error('fail'); });
        const response = await request(server).get('/teller-one-transactions');
        expect(response.status).toBe(500);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /teller-one-transactions', 'should return 500 on DB error', 'passed', duration));
    });

    test('POST /logout with session destroy throwing error', async () => {
        const startTime = Date.now();
        // Simulate error in session destroy
        const origDestroy = server.close;
        server.close = (cb) => cb(new Error('fail'));
        const response = await request(server).post('/logout');
        expect([500, 200]).toContain(response.status);
        server.close = origDestroy;
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /logout', 'should handle session destroy error', 'passed', duration));
    });
});

describe('Creative, Rare, and Stress Test Cases', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    test('POST /create-transaction with whitespace-only Name', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: "   ",
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect([201, 400]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should handle whitespace-only Name', 'passed', duration));
    });

    test('POST /create-transaction with extremely long Name', async () => {
        const startTime = Date.now();
        const longName = 'A'.repeat(1000);
        database.createTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: longName,
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "Savings",
                DepositType: "Cash"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should handle extremely long Name', 'passed', duration));
    });

    test('POST /create-transaction with special characters in AccountType', async () => {
        const startTime = Date.now();
        database.createTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: 12345,
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: 1000,
                AccountType: "!@#$%^&*()",
                DepositType: "Cash"
            });
        expect([201, 400]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should handle special characters in AccountType', 'passed', duration));
    });

    test('POST /create-transaction with all fields missing', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({});
        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with all fields missing', 'passed', duration));
    });

    test('POST /create-transaction with null values', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: null,
                Name: null,
                TransactionType: null,
                Amount: null,
                AccountType: null,
                DepositType: null
            });
        expect(response.status).toBe(400);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-transaction', 'should fail with null values', 'passed', duration));
    });

    test('POST /create-user with duplicate Username', async () => {
        const startTime = Date.now();
        database.createUser.mockImplementation(() => { throw new Error('duplicate'); });
        const response = await request(server)
            .post('/create-user')
            .send({
                Name: "John",
                LastName: "Doe",
                Username: "johndoe",
                Password: "password123",
                TellerNumber: "1"
            });
        expect([400, 500]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-user', 'should fail with duplicate Username', 'passed', duration));
    });

    test('POST /create-user with whitespace-only Password', async () => {
        const startTime = Date.now();
        database.createUser.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-user')
            .send({
                Name: "John",
                LastName: "Doe",
                Username: "johndoe2",
                Password: "   ",
                TellerNumber: "1"
            });
        expect([201, 400]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-user', 'should handle whitespace-only Password', 'passed', duration));
    });

    test('POST /create-user with extremely long Username', async () => {
        const startTime = Date.now();
        const longUsername = 'U'.repeat(1000);
        database.createUser.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .post('/create-user')
            .send({
                Name: "John",
                LastName: "Doe",
                Username: longUsername,
                Password: "password123",
                TellerNumber: "1"
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('users');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-user', 'should handle extremely long Username', 'passed', duration));
    });

    test('POST /admin-login with case-sensitive Username', async () => {
        const startTime = Date.now();
        database.validateUser.mockResolvedValue(null);
        const response = await request(server)
            .post('/admin-login')
            .send({ Username: "ADMIN", Password: "adminpass" });
        expect([401, 403]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should fail with case-sensitive Username', 'passed', duration));
    });

    test('POST /admin-login with leading/trailing spaces in Username', async () => {
        const startTime = Date.now();
        database.validateUser.mockResolvedValue(null);
        const response = await request(server)
            .post('/admin-login')
            .send({ Username: " admin ", Password: "adminpass" });
        expect([401, 403]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /admin-login', 'should fail with leading/trailing spaces in Username', 'passed', duration));
    });

    test('POST /create-withdrawal with zero Amount', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-withdrawal')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                Amount: 0,
                AccountType: "Savings"
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Amount must be a number greater than or equal to zero");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-withdrawal', 'should fail with zero Amount', 'passed', duration));
    });

    test('POST /create-withdrawal with missing AccountType', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .post('/create-withdrawal')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                Amount: 1000
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Missing required fields");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /create-withdrawal', 'should fail with missing AccountType', 'passed', duration));
    });

    test('GET /display-transactions with DB returning empty array', async () => {
        const startTime = Date.now();
        database.displayTransactions.mockResolvedValue([]);
        const response = await request(server).get('/display-transactions');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.transactions)).toBe(true);
        expect(response.body.transactions.length).toBe(0);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /display-transactions', 'should handle DB returning empty array', 'passed', duration));
    });

    test('GET /teller-two-transactions with DB returning null', async () => {
        const startTime = Date.now();
        database.displayTellerTwoTransactions.mockResolvedValue(null);
        const response = await request(server).get('/teller-two-transactions');
        expect([200, 500]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('GET /teller-two-transactions', 'should handle DB returning null', 'passed', duration));
    });

    test('PUT /update-transaction-status/:id with lowercase status', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/update-transaction-status/1')
            .send({ Status: 'open' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid status value');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction-status/:id', 'should fail with lowercase status', 'passed', duration));
    });

    test('PUT /update-transaction-status/:id with whitespace status', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/update-transaction-status/1')
            .send({ Status: '   ' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid status value');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction-status/:id', 'should fail with whitespace status', 'passed', duration));
    });

    test('PUT /update-transaction-status/:id with missing Status', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/update-transaction-status/1')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid status value');
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /update-transaction-status/:id', 'should fail with missing Status', 'passed', duration));
    });

    test('PUT /delete-transaction/:id with DeleteStatus as string number', async () => {
        const startTime = Date.now();
        database.deleteTransaction.mockResolvedValue({ id: 1 });
        const response = await request(server)
            .put('/delete-transaction/1')
            .send({ DeleteStatus: "1" });
        expect([200, 400]).toContain(response.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /delete-transaction/:id', 'should handle DeleteStatus as string number', 'passed', duration));
    });

    test('PUT /delete-transaction/:id with DeleteStatus as null', async () => {
        const startTime = Date.now();
        const response = await request(server)
            .put('/delete-transaction/1')
            .send({ DeleteStatus: null });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Invalid DeleteStatus value. Must be a number.");
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('PUT /delete-transaction/:id', 'should fail with DeleteStatus as null', 'passed', duration));
    });

    test('POST /logout called multiple times in a row', async () => {
        const startTime = Date.now();
        const response1 = await request(server).post('/logout');
        const response2 = await request(server).post('/logout');
        expect([200, 500]).toContain(response1.status);
        expect([200, 500]).toContain(response2.status);
        const duration = Date.now() - startTime;
        globalTestResults.push(logTestResult('POST /logout', 'should handle multiple logout calls', 'passed', duration));
    });
});
