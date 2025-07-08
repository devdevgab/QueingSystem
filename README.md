# Banking Queuing System

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
| **Computer Operator** | 192.168.10.245, 192.168.10.115 | All transactions | Full system access, admin functions |
| **Teller 1** | 192.168.10.245, 192.168.10.237, 192.168.10.157 | Withdrawals | Process withdrawal transactions |
| **Teller 2** | 192.168.10.24 | Collection, Account Close, Voucher, Dismember, Loan Release | Specialized banking transactions |
| **Teller 3** | 192.168.10.24 | Payment, Deposit | Payment and deposit transactions |
| **Teller 4** | 192.168.10.166 | Voucher, ATM Cash Deposit, Deposit | Voucher and ATM-related transactions |
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
   if (realIP == "192.168.10.245" || realIP == "192.168.10.237" || realIP == "192.168.10.157") {
       tellerNumber = "1"
   }
   // Teller 2: Collections, Account Close, Voucher, Dismember, Loan Release
   else if (realIP == "192.168.10.24") {
       tellerNumber = "2"
   }
   // Teller 3: Payment, Deposit
   else if (realIP == "192.168.10.24") {
       tellerNumber = "3"
   }
   // Teller 4: Voucher, ATM Cash Deposit, Deposit
   else if (realIP == "192.168.10.166") {
       tellerNumber = "4"
   }
   // Computer Operator (Teller 5): All transactions
   else if (realIP == "192.168.10.245" || realIP == "192.168.10.115") {
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

## 🧪 Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend/queuing && npm test
```

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

