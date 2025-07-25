# Banking Queuing System

## 🚀 Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" alt="SQL Server"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/bcryptjs-efb32a?style=for-the-badge&logoColor=white" alt="bcryptjs"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material-UI"/>
</p>

A comprehensive banking queuing system built with React.js frontend and Node.js backend, designed to manage customer transactions across multiple teller stations with role-based access control and real-time transaction processing.

## 🏗️ Architecture

### Frontend
- **Framework**: React.js 19.1.0 with React Router DOM
- **UI**: Material-UI (MUI) with CSS Variables for theming
- **State Management**: React Context API
- **Build Tool**: Create React App

### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js with JWT authentication
- **Database**: Microsoft SQL Server (MSSQL)
- **Security**: bcryptjs for password hashing, Express Session
- **CORS**: Cross-Origin Resource Sharing enabled

### Database
- **Database**: Microsoft SQL Server
- **Tables**: 
  - `tbl_Transactions` - Stores all transaction data
  - `tbl_Users` - Stores user accounts and authentication

## 🚀 Features

- **Multi-Teller Support**: 4 teller stations + 1 computer operator station
- **Transaction Types**: Withdrawal, Deposit, Payment, Disbursement, Collection, Voucher, ATM Cash Deposit, Account Close, Dismember, Loan Release
- **Role-Based Access Control**: Different interfaces for tellers vs computer operators
- **Real-Time Transaction Processing**: Immediate transaction creation and status updates
- **IP-Based Authentication**: Automatic teller assignment based on IP address
- **Session Management**: Secure user sessions with JWT tokens

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes with accessibility support
- **Loading Screens**: Smooth transitions and loading states
- **Toast Notifications**: Real-time feedback for user actions
- **Form Validation**: Client-side and server-side validation
- **Accessibility Features**: Screen reader support and keyboard navigation

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Protection**: Configured for specific origins
- **Session Security**: HTTP-only cookies and secure session handling
- **Real-Time Processing**: Immediate transaction creation and status updates
- **Responsive UI**: Dark/Light theme with accessibility support
- **Security**: JWT tokens, input validation, SQL injection prevention

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v16 or higher)
- **Microsoft SQL Server** (2016 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation

### 1. Clone and Setup
```bash
https://github.com/devdevgab/QueingSystem.git
cd QueingSystem
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Configuration

Create a `.env` file in the backend directory with your database credentials:
```env
SQLSERVER_USER=your_username
SQLSERVER_PASSWORD=your_password
SQLSERVER_HOST=your_server_host
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=db_QueuingSystem
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
PORT=8080
```



### 4. Frontend Setup
```bash
cd frontend/queuing
npm install
```

## 🚀 Running the Application

### Development Mode
```bash
# Backend (Terminal 1)
cd backend
node api.js

# Frontend (Terminal 2)
cd frontend/queuing
npm start
```

### Production Mode
```bash
cd frontend/queuing
npm run build
npm run prod
```

## 🏦 System Roles & Access

| Role | IP Addresses | Transaction Types | Capabilities |
|------|-------------|------------------|--------------|
| **Computer Operator** | 192.168.10.xx, 192.168.10.xx | All transactions | Full system access, admin functions |
| **Teller 1** | 192.168.10.xx, 192.168.10.xx, 192.168.10.xx | Withdrawals | Process withdrawal transactions |
| **Teller 2** | 192.168.10.xx | Collection, Account Close, Voucher, Dismember, Loan Release | Specialized banking transactions |
| **Teller 3** | 192.168.10.xx | Payment, Deposit | Payment and deposit transactions |
| **Teller 4** | 192.168.10.xx | Voucher, ATM Cash Deposit, Deposit | Voucher and ATM-related transactions |
| **Admin** | Teller Number: 100 | All | Full system access, user management |

## 🔌 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /admin-login` - Admin login
- `POST /logout` - User logout
- `POST /create-user` - Create new user account

### Transactions
- `POST /create-transaction` - Create new transaction
- `POST /create-withdrawal` - Create withdrawal transaction
- `GET /display-transactions` - Get all transactions
- `GET /my-transactions` - Get user's transactions
- `PUT /update-transaction/:id` - Update transaction
- `PUT /update-transaction-status/:id` - Update transaction status
- `PUT /delete-transaction/:id` - Soft delete transaction

### Teller-Specific
- `GET /teller-one-transactions` - Teller 1 (Withdrawals)
- `GET /teller-two-transactions` - Teller 2 (Collections, etc.)
- `GET /teller-three-transactions` - Teller 3 (Payments, Deposits)
- `GET /teller-four-transactions` - Teller 4 (Vouchers, ATM)

## 🔧 Configuration

### Changing IP Addresses for Teller Assignment

The system automatically assigns teller numbers based on the client's IP address. To modify IP address assignments:

1. **Navigate to the Login Function**:
   Open `backend/api.js` and locate the login function (around line 58)

2. **Current IP Configuration**:
   ```javascript
   // Teller 1: Withdrawals
   if (realIP == "192.168.10.xx" || realIP == "192.168.10.xx" || realIP == "192.168.10.xx") {
       tellerNumber = "1"
   }
   // Teller 2: Collections, Account Close, Voucher, Dismember, Loan Release
   else if (realIP == "192.168.10.xx") {
       tellerNumber = "2"
   }
   // Teller 3: Payment, Deposit
   else if (realIP == "192.168.10.xx") {
       tellerNumber = "3"
   }
   // Teller 4: Voucher, ATM Cash Deposit, Deposit
   else if (realIP == "192.168.10.xx") {
       tellerNumber = "4"
   }
   // Computer Operator (Teller 5): All transactions
   else if (realIP == "192.168.10.xx" || realIP == "192.168.10.xx") {
       tellerNumber = "5"
   }
   ```

3. **Modify IP Addresses**: Replace with your network's IP addresses
4. **Restart Server**: `cd backend && node api.js`

### CORS Configuration

To change the allowed frontend URL, modify the CORS configuration in `backend/api.js`:

```javascript
const corsOptions = {
    origin: "http://your-frontend-ip:3000",  // Change this to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
```

### Environment Variables

| Issue | Solution |
|-------|----------|
| **Database Connection Failed** | Verify SQL Server is running, check `.env` credentials |
| **CORS Errors** | Update CORS origin in `backend/api.js` |
| **Authentication Issues** | Clear localStorage, verify JWT_SECRET |
| **Port Already in Use** | Change PORT in `.env` or kill existing processes |

## 🔑 Security: Generating JWT Secret Key and Token

### 1. Generating a Secure Secret Key
Your JWT secret key should be a long, random string. You can generate one using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Or use an online password generator (at least 32 characters, with symbols).

**Example:**
```
Vt9@5G!kWz#17Np$eR4xUbM&LcQ2^HaZ
```
Add this to your `.env` file as:
```
JWT_SECRET=your_generated_secret_key
```

### 2. Generating a JWT Token for Testing
You can generate a JWT token using Node.js:

```js
const jwt = require('jsonwebtoken');
const payload = { name: 'gabriel' }; // customize as needed
const secretKey = 'your_generated_secret_key';
const token = jwt.sign(payload, secretKey, { expiresIn: '5h' });
console.log(token);
```
Or use online tools like [jwt.io](https://jwt.io/) for manual creation and decoding.

### 3. Security Best Practices
- **Never share your secret key publicly or commit it to version control.**
- **Always use a strong, random secret key.**
- **Rotate your secret key periodically for enhanced security.**

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Database Connection Failed** | Verify SQL Server is running, check `.env` credentials |
| **CORS Errors** | Update CORS origin in `backend/api.js` |
| **Authentication Issues** | Clear localStorage, verify JWT_SECRET |
| **Port Already in Use** | Change PORT in `.env` or kill existing processes |

## 🧪 Testing

```

# API Automated Test Documentation

## How to Run the Tests

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher recommended)

### Install Dependencies
Navigate to the `backend` directory and run:
```bash
npm install
```

### Run All Tests
From the `backend` directory, run:
```bash
npm test
```

### Run Tests in Watch Mode (optional)
```bash
npm run test:watch
```

> The tests use Jest and Supertest. All database and authentication logic is mocked for isolation and speed. Test results are displayed in the console as a table and saved to `test-results.txt`.

---

## Table of Contents
- [Login Endpoint](#login-endpoint)
- [POST /create-transaction](#post-create-transaction)
- [POST /create-user](#post-create-user)
- [PUT /update-transactionid](#put-update-transactionid)
- [GET /display-transactions](#get-display-transactions)
- [GET /my-transactions](#get-my-transactions)
- [PUT /delete-transactionid](#put-delete-transactionid)
- [PUT /update-userid](#put-update-userid)
- [POST /logout](#post-logout)
- [GET /get-user-ip](#get-get-user-ip)
- [GET /lockIp](#get-lockip)
- [PUT /update-transaction-statusid](#put-update-transaction-statusid)
- [GET /teller-one-two-three-four-transactions](#get-teller-one-two-three-four-transactions)
- [POST /create-withdrawal](#post-create-withdrawal)
- [POST /admin-login](#post-admin-login)
- [Advanced and Edge Case Tests](#advanced-and-edge-case-tests)
- [More Advanced and Negative Tests](#more-advanced-and-negative-tests)
- [Creative, Rare, and Stress Test Cases](#creative-rare-and-stress-test-cases)
- [Production-Grade & Security Tests](#production-grade--security-tests)

---

## Login Endpoint
- **Valid login:** Should succeed with correct credentials.
- **Invalid credentials:** Should fail with 401.
- **Invalid token:** Should fail with 401.
- **Server error:** Should return 500 on internal error.

## POST /create-transaction
- **Success:** Should create a transaction with valid data.
- **Missing fields:** Should fail with 400.
- **Invalid Amount:** Should fail if Amount is not a valid number or is negative/zero.
- **Missing DepositType:** Should fail for deposit transactions.
- **Server error:** Should return 500 on DB error.

## POST /create-user
- **Success:** Should create a user with valid data.
- **Missing fields:** Should fail with 400.
- **Server error:** Should return 500 on DB error.

## PUT /update-transaction/:id
- **Success:** Should update a transaction.
- **Missing fields:** Should fail with 400.
- **Not found:** Should return 404 if transaction does not exist.

## GET /display-transactions
- **Success:** Should return transactions.
- **Server error:** Should return 500 on DB error.

## GET /my-transactions
- **Success:** Should return user’s transactions.
- **Server error:** Should return 500 on DB error.

## PUT /delete-transaction/:id
- **Success:** Should delete a transaction.
- **Invalid DeleteStatus:** Should fail if not a number.
- **Not found:** Should return 404 if transaction does not exist.

## PUT /update-user/:id
- **Success:** Should update a user.
- **Missing fields:** Should fail with 400.
- **Not found:** Should return 404 if user does not exist.

## POST /logout
- **Success:** Should log out successfully.
- **Server error:** Should return 500 on session destroy error.
- **No session:** Should handle logout without session.

## GET /get-user-ip
- **Success:** Should return the user’s IP.

## GET /lockIp
- **Success:** Should lock the IP.

## PUT /update-transaction-status/:id
- **Success:** Should update transaction status.
- **Invalid status:** Should fail with 400.
- **Not found:** Should return 404 if transaction does not exist.

## GET /teller-one/two/three/four-transactions
- **Success:** Should return transactions for each teller.
- **DB error:** Should return 500 on DB error (for teller one).

## POST /create-withdrawal
- **Success:** Should create a withdrawal.
- **Missing fields:** Should fail with 400.
- **Invalid Amount:** Should fail if Amount is not valid.

## POST /admin-login
- **Success:** Should log in as admin.
- **Missing fields:** Should fail with 400.
- **Not admin:** Should fail with 403.
- **Invalid credentials:** Should fail with 401.

## Advanced and Edge Case Tests
- **String for Amount:** Should fail.
- **Boundary values:** Should fail with Amount=0, succeed with max int.
- **Extra/unexpected fields:** Should ignore.
- **Empty body:** Should fail.
- **Missing token:** Should fail with 401/500.
- **SQL injection/XSS:** Should not break.
- **Double submission:** Should handle idempotency.
- **Logout without session:** Should handle gracefully.

## More Advanced and Negative Tests
- **Negative AccountNumber, Name as number, missing TransactionType, Amount above max int, invalid AccountType, PaymentType for Deposit, DisbursementType for Payment:** Should handle or fail as appropriate.
- **DB error, empty body, invalid Username, empty admin-login, not admin, negative withdrawal Amount, AccountNumber as string, DB error for teller, session destroy error:** Should handle or fail as appropriate.

## Creative, Rare, and Stress Test Cases
- **Whitespace/long/special chars in fields, all fields missing/null, duplicate Username, whitespace Password, long Username, case/space Username, zero/missing withdrawal fields, DB returns empty/null, lowercase/whitespace/missing status, DeleteStatus as string/null, multiple logouts:** Should handle or fail as appropriate.

## Production-Grade & Security Tests
- **Rate limiting:** Should handle rapid requests.
- **Role enforcement:** Should require correct role.
- **Expired token:** Should reject.
- **Unicode/emoji:** Should handle.
- **Large payloads:** Should handle or reject.
- **Invalid Content-Type:** Should handle or reject.
- **CORS:** Should block disallowed origins.
- **Malformed JSON:** Should handle gracefully.
- **Concurrency:** Should handle simultaneous requests.
- **DB connection failure/read-only:** Should return 500.
- **HTTP/HTTPS redirection:** Should handle as per logic.
- **Wrong HTTP method:** Should reject.
- **Missing headers:** Should handle or reject.
- **Response time:** Should be <2s.

---

**How to Use:**
- Each test suite corresponds to an API endpoint or feature.
- Each test case describes a scenario and the expected outcome.
- Use this as a reference for what is covered and for future test additions. 













## 📁 Project Structure

```
QueingSystem/
├── backend/
│   ├── api.js                 # Main Express server
│   ├── database.js            # Database operations
│   ├── middleware/authMiddleware.js  # JWT authentication
│   ├── tests/                 # Backend tests
│   └── schema.sql            # Database schema
├── frontend/queuing/
│   ├── src/components/        # React components
│   ├── src/context/           # React context
│   ├── src/css/              # Stylesheets
│   ├── public/               # Public assets
│   └── server.js             # Production server
└── README.md                 # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Note**: This system is designed for internal banking operations and should be deployed in a secure, private network environment.

