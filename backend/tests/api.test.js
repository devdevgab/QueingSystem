import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { testConfig } from './config.js';

// Create mock functions
const mockGetUserIP = jest.fn();
const mockVerifiyToken = jest.fn();
const mockValidateUser = jest.fn();
const mockCreateTransaction = jest.fn();
const mockAuthenticateToken = jest.fn();
const mockCreateUser = jest.fn();

// Mock the database functions
jest.mock('../database.js', () => ({
    getUserIP: () => mockGetUserIP(),
    verifiyToken: () => mockVerifiyToken(),
    validateUser: (Username, Password) => mockValidateUser(Username, Password),
    createTransaction: (...args) => mockCreateTransaction(...args),
    createUser: (...args) => mockCreateUser(...args)
}));

jest.mock('../middleware/authMiddleware.js', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { tellerNumber: "3" }; // Simulate authenticated user
        next();
    }
}));



// Create a test app
const app = express();
app.use(express.json());

// Create server instance that will be shared across all test suites
let server;

beforeAll(() => {
    // Start the server on a different port for testing
    server = app.listen(0); // Using port 0 lets the OS assign an available port
});

afterAll((done) => {
    // Close the server after all tests
    server.close(done);
});

// Mock the login endpoint
app.post('/login', async (req, res) => {
    const { Username, Password } = req.body;
    console.log('Login attempt with:', { Username, Password }); // Debug log

    try {
        var tellerNumber = 0;
        const realIP = mockGetUserIP();
        if (realIP == "192.168.10.245" || realIP == "192.168.10.237" || realIP == "192.168.10.115") {
            tellerNumber = "1"
        }
        else if (realIP == "192.168.10.153") {
            tellerNumber = "2"
        }
        else if (realIP == "192.168.10.154") {
            tellerNumber = "3"
        }
        else if (realIP == "192.168.10.166") {
            tellerNumber = "4"
        }
        else if (realIP == "192.168.10.245" || realIP == "192.168.10.115") {
            tellerNumber = "5" // Computer Operator
        }

        const payload = {
            name: "gabriel",
            ip: realIP,
            tellerNumber: tellerNumber,
            role: tellerNumber === "5" ? "computer_operator" : "teller"
        };

        const token = jwt.sign(payload, testConfig.JWT_SECRET, { expiresIn: "1h" });
        const validResult = await mockVerifiyToken();
        console.log('Token validation result:', validResult); // Debug log

        if (validResult) {
            const user = await mockValidateUser(Username, Password);
            console.log('User validation result:', user); // Debug log
            if (!user) {
                return res.status(401).json({ message: "Invalid username or password" });
            }
            req.session = { user: { user, token } };
            res.status(200).json({
                message: "Login successful",
                token,
                role: payload.role
            });
        } else {
            return res.status(401).json({ message: "Invalid Token" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Mock the create-transaction endpoint
app.post('/create-transaction', async (req, res) => {
    const { AccountNumber, Name, TransactionType, Amount, AccountType, DepositType, PaymentType, DisbursementType } = req.body;
    const DeleteStatus = 0;

    // Basic validation for all transactions
    if (!AccountNumber || !Name || !TransactionType || !Amount || !AccountType) {
        return res.status(400).send("Missing required fields");
    }

    // Validate Amount is a valid number
    if (isNaN(Amount) || !Number.isInteger(Number(Amount)) || Number(Amount) <= 0) {
        return res.status(400).send("Amount must be a positive integer");
    }

    // Type-specific validation
    switch (TransactionType) {
        case 'Deposit':
            if (!DepositType) {
                return res.status(400).send("Deposit type is required for deposit transactions");
            }
            break;
        case 'Payment':
            if (!PaymentType) {
                return res.status(400).send("Payment type is required for payment transactions");
            }
            break;
        case 'Disbursement':
            if (!DisbursementType) {
                return res.status(400).send("Disbursement type is required for disbursement transactions");
            }
            break;
    }

    try {
        const transaction = await mockCreateTransaction(
            AccountNumber,
            Name,
            TransactionType,
            DeleteStatus,
            Amount,
            AccountType,
            DepositType,
            PaymentType,
            DisbursementType
        );
        res.status(201).send({ transaction });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

// Mock the create-user endpoint
app.post("/create-user", async (req, res) => {
    const { Name, LastName, Username, Password, TellerNumber } = req.body;

    if (!Name || !LastName || !Username || !Password || !TellerNumber) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const users = await mockCreateUser(Name, LastName, Username, Password, TellerNumber);
        res.status(201).send({ users });
    } catch (error) {
        console.error(error);
        res.status(500).send("internal server error");
    }
});

describe('Login Endpoint', () => {
    let originalConsoleError;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        // Store original console.error
        originalConsoleError = console.error;
    });

    afterEach(() => {
        // Restore console.error after each test
        console.error = originalConsoleError;
    });

    test('should successfully login with valid credentials', async () => {
        // Mock the required functions
        mockGetUserIP.mockReturnValue(testConfig.TEST_IP);
        mockVerifiyToken.mockResolvedValue(true);
        mockValidateUser.mockImplementation((Username, Password) => {
            console.log('Mock validateUser called with:', { Username, Password }); // Debug log
            // Simulate database validation
            if (Username === 'gaby' && Password === '123') {
                return {
                    id: 1,
                    username: 'gaby',
                    name: "gabriel"
                };
            }
            return null;
        });

        const response = await request(server)
            .post('/login')
            .send({
                Username: 'gaby',
                Password: '123'
            });

        console.log('Response:', response.body); // Debug log
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('role');
        expect(response.body.message).toBe('Login successful');
    });

    test('should fail with invalid credentials', async () => {
        // Mock the required functions
        mockGetUserIP.mockReturnValue(testConfig.TEST_IP);
        mockVerifiyToken.mockResolvedValue(true);
        mockValidateUser.mockImplementation((Username, Password) => {
            console.log('Mock validateUser called with:', { Username, Password }); // Debug log
            // Simulate database validation
            if (Username === 'gaby' && Password === '123') {
                return {
                    id: 1,
                    username: 'gaby',
                    name: "gabriel"
                };
            }
            return null;
        });

        const response = await request(server)
            .post('/login')
            .send({
                Username: 'wronguser',
                Password: 'wrongpass'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');
    });

    test('should fail with invalid token', async () => {
        // Mock the required functions
        mockGetUserIP.mockReturnValue(testConfig.TEST_IP);
        mockVerifiyToken.mockResolvedValue(false);

        const response = await request(server)
            .post('/login')
            .send({
                Username: 'gaby',
                Password: '123'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid Token');
    });

    test('should handle server errors gracefully', async () => {
        // Mock console.error to prevent error output
        console.error = jest.fn();

        // Mock the required functions to throw an error
        mockGetUserIP.mockImplementation(() => {
            throw new Error('Database error');
        });

        const response = await request(server)
            .post('/login')
            .send({
                Username: 'gaby',
                Password: '123'
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(console.error).toHaveBeenCalled();
    });
});


describe('POST /create-transaction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create transaction successfully', async () => {
        const mockTx = { id: 1, AccountNumber: "12345" };
        mockCreateTransaction.mockResolvedValue(mockTx);

        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: "5000",
                AccountType: "Savings",
                DepositType: "Cash"
            });z
            

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
        expect(mockCreateTransaction).toHaveBeenCalled();
    });

    test('should fail if required fields are missing', async () => {
        const response = await request(server)
            .post('/create-transaction')
            .send({
                Name: "Gabriel", // Missing AccountNumber, TransactionType, etc.
            });


        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
    });
    
    test('should fail if Amount is not a valid number', async () => {
        const response = await request(server)
            .post('/create-transaction')
            .send({
                AccountNumber: "12345",
                Name: "Gabriel",
                TransactionType: "Deposit",
                Amount: "-100", // Invalid
                AccountType: "Savings",
                DepositType: "Cash"
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe("Amount must be a positive integer");
    });

    test('should fail if DepositType is missing for Deposit transaction', async () => {
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
    });

    test('should return 500 on server error', async () => {
        mockCreateTransaction.mockImplementation(() => {
            throw new Error("Database failure");
        });

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
    });
});







describe('POST /create-user', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create user successfully', async () => {
        const mockUser = {
            id: 1,
            Name: "John",
            LastName: "Doe",
            Username: "johndoe",
            TellerNumber: "1"
        };
        mockCreateUser.mockResolvedValue(mockUser);

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
        expect(mockCreateUser).toHaveBeenCalledWith(
            "John",
            "Doe",
            "johndoe",
            "password123",
            "1"
        );
    });

    test('should fail if required fields are missing', async () => {
        const response = await request(server)
            .post('/create-user')
            .send({
                Name: "John",
                // Missing LastName, Username, Password, and TellerNumber
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe("Missing required fields");
    });

    test('should return 500 on server error', async () => {
        mockCreateUser.mockImplementation(() => {
            throw new Error("Database failure");
        });

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
    });
});
