import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createTransaction, updateTransaction, displayTransactions, displayTellerOneTransactions, deleteTransaction, displayMyTransactions, verifiyToken, createUser, updateUser, getUserIP, lockIP, validateUser, updateTransactionStatus, displayTellerTwoTransactions, displayTellerThreeTransactions, displayTellerFourTransactions, createWithdrawalTransaction } from './database.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import { fileURLToPath } from 'url';

const app = express();

app.use(bodyParser.json({
    limit: '50mb',
    extended: true,
    charset: 'utf-8'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    charset: 'utf-8'
}));

dotenv.config();

const corsOptions = {
    origin: "http://192.168.10.245:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
    }



}));

app.use((req, res, next) => {
    // Check if the request is coming over HTTPS
    if (req.headers['x-forwarded-proto'] === 'https' || req.secure) {
        // Redirect to HTTP version
        const httpUrl = `http://${req.headers.host}${req.url}`;
        return res.redirect(httpUrl);
    }
    next();
});

app.post("/login", async (req, res) => {
    const { Username, Password } = req.body;

    try {
        var tellerNumber = 0;
        const realIP = getUserIP(req);
        // Fetch user from database to get TellerNumber before proceeding
        const user = await validateUser(Username, Password);
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        if (user.TellerNumber === 100) {
            return res.status(403).json({ message: "You have tried to logged in from a non-authorized IP using admin account, please use a valid Teller Account" });
        }


        if (realIP == "192.168.10.245" || realIP == "192.168.10.237" || realIP == "192.168.10.157") {
            tellerNumber = "1"
        }
        else if (realIP == "192.168.10.24") {
            tellerNumber = "2"
        }
        else if (realIP == "192.168.10.24") {
            tellerNumber = "3"
        }
        else if (realIP == "192.168.10.166") {
            tellerNumber = "4"
        }
        else if (realIP == "192.168.10.245" || realIP == "192.168.10.115") {
            tellerNumber = "5" // Computer Operator
        }
        // else {
        //     return res.status(401).json({
        //         message: "You have tried to logged in from a non-authorized IP using admin account, please use a valid Teller Account"
        //     });
        // }


        console.log(`User Login Attempt from IP: ${realIP}`);


        const payload = {
            name: "gabriel",
            ip: realIP,
            tellerNumber: tellerNumber,
            role: tellerNumber === "5" ? "computer_operator" : "teller"
        };



        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });

        const validResult = await verifiyToken(token)
        console.log("hello", validResult);

        if (validResult) {
            console.log("Token is legal")
            const user = await validateUser(Username, Password);
            if (!user) {
                return res.status(401).json({ message: "Invalid username or password" });
            }
            req.session.user = {
                user,
                token: token
            };

            res.status(200).json({
                message: "Login successful",
                token,
                // role: payload.role
            });
        }
        else {
            console.log("Token is not legal")
            return res.status(401).json({ message: "Invalid Token" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});






app.post("/create-transaction", authenticateToken, async (req, res) => {
    const { AccountNumber, Name, TransactionType, Amount, AccountType, DepositType, PaymentType, DisbursementType } = req.body;
    const DeleteStatus = 0;

    // Basic validation for all transactions
    if (!AccountNumber || !Name || !TransactionType || !Amount || !AccountType) {
        return res.status(400).send("Missing required fields");
    }

    // Validate that Name is not a number
    if (!isNaN(Name) && Number.isInteger(Number(Name))) {
        return res.status(400).json({ message: "Name cannot be a number" });
    }

    // Validate Amount is a valid number
    if (isNaN(Amount) || !Number.isInteger(Number(Amount))) {
        return res.status(400).send("Amount must be a valid integer");
    }


    // Check SQL Server INT range
    const amountNum = Number(Amount);
    if (amountNum <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (amountNum > 2147483647) {
        return res.status(400).json({ message: "Amount is too high. Must be less than or equal to 2,147,483,647" });
    }

    if (isNaN(AccountNumber) || !Number.isInteger(Number(AccountNumber)) || Number(AccountNumber) <= 0) {
        return res.status(400).send("Account Number must be a positive integer");
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
        // Get teller number from the authenticated user (set by middleware)
        const tellerNumber = req.user.tellerNumber;

        if (!tellerNumber) {
            return res.status(401).send("Unauthorized: Teller number not found");
        }

        const transaction = await createTransaction(
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

app.put("/update-transaction/:id", async (req, res) => {
    // const userRole = req.session.role;

    const { id } = req.params;

    const { AccountNumber, Name, TransactionType } = req.body;

    if (!AccountNumber || !Name || !TransactionType) {
        return res.status(400).send("Missing required fields");
    }

    // if (userRole != 2) {
    //     return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    // }

    try {
        const updatedTransaction = await updateTransaction(id, { AccountNumber, Name, TransactionType });
        if (!updatedTransaction) {
            return res.status(404).send("Transaction not found");
        }
        res.status(200).send({ updatedTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }


});

// app.get("/display-transactions", authenticateToken,async (req, res) => {
//     if (!req.session.user) {
//         return res.status(401).json({ message: "Unauthorized: No active session" });
//     }

//     const token = req.session.user.token;
//     const validResult = await verifiyToken(token);

//     try {
//         let transactions = []; // ✅ Declare transactions outside of the block

//         if (validResult) {
//             console.log("Token is legal");
//             transactions = await displayTransactions(); // ✅ Assign transactions here
//         } else {
//             console.log("Token is not legal");
//             return res.status(401).json({ message: "Invalid Token" });
//         }
//         console.log(req.session.user)
//         res.status(200).json({ transactions }); // ✅ Send response after transactions is assigned

//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal server error");
//     }
// });


app.get("/display-transactions", authenticateToken, async (req, res) => {
    try {
        console.log("Authenticated user:", req.user); // req.user was attached by middleware

        const transactions = await displayTransactions(); // Your DB call or service


        res.status(200).json({ transactions });
    } catch (error) {
        console.error("Transaction fetch error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/my-transactions", authenticateToken, async (req, res) => {
    try {
        console.log("Authenticated user:", req.user); // From JWT payload

        const transactions = await displayMyTransactions(); // Only withdrawals, teller 1

        res.status(200).json({ transactions });
    } catch (error) {
        console.error("MyTransaction fetch error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});






app.put("/delete-transaction/:id", async (req, res) => {
    // const userRole = req.session.role;
    let { DeleteStatus } = req.body;
    const { id } = req.params;
    DeleteStatus = parseInt(DeleteStatus, 10);
    if (isNaN(DeleteStatus)) {
        return res.status(400).send("Invalid DeleteStatus value. Must be a number.");
    }

    // if (userRole != 2) {
    //     return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    // }

    try {
        const deletedTransaction = await deleteTransaction(id, { DeleteStatus });
        if (!deletedTransaction) {
            return res.status(404).send("Transaction not found");
        }
        res.status(200).send({ DeleteStatus });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});







app.post("/create-user", async (req, res) => {
    // const userRole = req.session.role;
    const { Name, LastName, Username, Password, TellerNumber } = req.body

    if (!Name || !LastName || !Username || !Password || !TellerNumber) {
        return res.status(400).send("Missing required fields");
    }

    // if(userRole !=2){
    //     return res.status(401).json({ message: 'User not admin error creating ' });
    // }

    try {
        const users = await createUser(Name, LastName, Username, Password, TellerNumber)
        res.status(201).send({ users });
    } catch (error) {
        console.error(error);
        res.status(500).send("internal server error")

    }



})



app.put("/update-user/:id", async (req, res) => {
    // const userRole = req.session.role;

    const { id } = req.params;

    const { Name, LastName, Username, Password } = req.body;

    if (!LastName || !Name || !Username || !Password) {
        return res.status(400).send("Missing required fields");
    }

    // if (userRole != 2) {
    //     return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    // }

    try {
        const updatedTransaction = await updateUser(id, { Name, LastName, Username, Password });
        if (!updatedTransaction) {
            return res.status(404).send("Transaction not found");
        }
        res.status(200).send({ updatedTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

//generate app . get function for logout delete token session and jwt session
app.post("/logout", async (req, res) => {
    try {
        // Clear the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Error during logout' });
            }
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




//get user ip route
app.get("/get-user-ip", (req, res) => {
    const userIP = getUserIP(req);
    res.json({ ip: userIP });
});

app.get("/lockIp", (req, res) => {
    const message = lockIP(req); // Pass `req` to `lockIP`
    res.json({ message });
});








// there will be 4 view page, one for each teller machine
// logic will be when the computer operator confirmed the user designation ie Withdrawal, Deposit etc.
// the web will then automatically chooses what view will be the teller machine. 
// 












app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')

})


const port = process.env.PORT || 8080;

// Only start the server if this file is run directly
const __filename = fileURLToPath(import.meta.url);
const __main = process.argv[1];

if (__filename === __main) {
    app.listen(port, () => {
        console.log(`✅ Server is running on port ${port}`);
    });
}


app.put("/update-transaction-status/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;

    // Validate status
    const validStatuses = ['In Progress', 'Open', 'Closed'];
    if (!validStatuses.includes(Status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const updatedTransaction = await updateTransactionStatus(id, Status);
        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({
            message: 'Status updated successfully',
            transaction: updatedTransaction
        });
    } catch (error) {
        console.error('Error updating transaction status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/teller-one-transactions", authenticateToken, async (req, res) => {
    try {
        const transactions = await displayTellerOneTransactions();
        res.json({ transactions });
    } catch (error) {
        console.error("Error fetching Teller 1 transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

app.get("/teller-two-transactions", authenticateToken, async (req, res) => {
    try {
        const transactions = await displayTellerTwoTransactions();
        res.json({ transactions });
    } catch (error) {
        console.error("Error fetching Teller 2 transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

app.get("/teller-three-transactions", authenticateToken, async (req, res) => {
    try {
        const transactions = await displayTellerThreeTransactions();
        res.json({ transactions });
    } catch (error) {
        console.error("Error fetching Teller 3 transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

app.get("/teller-four-transactions", authenticateToken, async (req, res) => {
    try {
        const transactions = await displayTellerFourTransactions();
        res.json({ transactions });
    } catch (error) {
        console.error("Error fetching Teller 4 transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

app.post("/create-withdrawal", authenticateToken, async (req, res) => {
    const { AccountNumber, Name, Amount, AccountType } = req.body;

    if (!AccountNumber || !Name || !Amount || !AccountType) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate that Name is not a number
    if (!isNaN(Name) && Number.isInteger(Number(Name))) {
        return res.status(400).json({ message: "Name cannot be a number" });
    }

    try {
        // Get teller number from the authenticated user (set by middleware)
        const tellerNumber = req.user.tellerNumber;

        if (isNaN(Amount) || Number(Amount) <= 0) {
            return res.status(400).json({ message: "Amount must be a number greater than or equal to zero" });
        }

        if (!tellerNumber) {
            return res.status(401).json({ message: "Unauthorized: Teller number not found" });
        }

        if (isNaN(AccountNumber) || !Number.isInteger(Number(AccountNumber)) || Number(AccountNumber) <= 0) {
            return res.status(400).json({ message: "Account Number must be in digits" });
        }

        const transaction = await createWithdrawalTransaction(AccountNumber, Name, Amount, AccountType);
        res.status(201).json({ transaction });
    } catch (error) {
        console.error("Error creating withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post("/admin-login", async (req, res) => {
    const { Username, Password } = req.body;

    if (!Username || !Password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // Validate user credentials and check TellerNumber
        const user = await validateUser(Username, Password);

        // Log the entire user object for debugging
        // console.log("Admin Login User Object:", user);

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Check if the user is an admin (TellerNumber == 100)
        if (user.TellerNumber !== 100) {
            return res.status(403).json({ message: "Access denied: Not an admin user" });
        }

        // Generate JWT token for admin
        const payload = {
            id: user.ID,
            username: user.Username,
            role: "admin",
            tellerNumber: user.TellerNumber
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });

        req.session.user = {
            user,
            token: token
        };

        res.status(200).json({
            message: "Admin login successful",

        });
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Export the app for testing
export default app;
