import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createTransaction, updateTransaction,displayTransactions,deleteTransaction,verifiyToken, createUser,updateUser,getUserIP,lockIP,validateUser } from './database.js';



//WHOEVER TAKES OVER THIS CODE PLEASE MAKE SURE TO CHANGE THE IP ADDRESS TO THE SERVER IP ADDRESS THIS CAN BE DONE ON THE LEFT
//SIDE OF VS CODE, BY CLICK THE SEARCH BUTTON AND CHOOSING REPLACE

//BEFORE PROCEEDING TO EDIT THE CODE BELOW PLEASE READ THE DOCUMENTATION ON THE BACKEND FOLDER, I PLACED A README FILE THERE


//I DONT KNOW HOW I WROTE THIS CODE BUT IT WORKS JUST FOLLOW THE PROPER BACKEND API CALLS AND YOU SHOULD BE FINE

// const express = require('express');
const app = express()

// app.use(cors());
app.use(bodyParser.json())

dotenv.config();


    

const corsOptions = {
    origin: "http://192.168.10.245:3000", // Allow your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Critical: Allows cookies to be sent
  };
  app.use(cors(corsOptions));


app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // ✅ Change to true if using HTTPS
        httpOnly: false, // ✅ Try setting to false for debugging
        sameSite: "lax", // ✅ Change to "none" if frontend is on a different origin
        maxAge: 60 * 60 * 1000 // 1 hour
    }
}));



// try {
//     const decoded = jwt.verify(token, secretKey);
//     console.log("JWT is valid:", decoded);
// } catch (err) {
//     console.log("JWT is invalid:", err.message);
// }




app.post("/login", async (req, res) => {
    const { Username, Password } = req.body;

    try {
        const realIP = getUserIP(req);
        console.log(`User Login Attempt from IP: ${realIP}`);
        

        const payload = {
            
            name: "gabriel"
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        const validResult = await verifiyToken(token)
        console.log("hello",validResult);

        if(validResult){
            console.log("Token is legal")
            const user = await validateUser(Username, Password);
            if (!user) {
                return res.status(401).json({ message: "Invalid username or password" });
            }
            req.session.user = {
                //add details here for now ill add static data
                user,
                token: token
 
            };
            // console.log("Session Created:", req.session.user.user.Name, req.session.user.user.LastName, req.session.user.token);   
            res.status(200).json({
                message: "Login successful",
                token
            }); 

            

            

            
        }
        else{
            console.log("Token is not legal")
            return res.status(401).json({ message: "Invalid Token" });
            
        }

        // const user = await validateUser(Username, Password);{
        // if (!user) {
        //     return res.status(401).json({ message: "Invalid username or password" });
        // }
        // req.session.user = {
    //}
         
        // if (!user) {
        //     return res.status(401).json({ message: "Invalid username or password" });
        // }

        
    
        

        




    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




app.post("/create-transaction", async (req, res) => {
    const userRole = req.session.role;
    const { AccountNumber, Name, TransactionType } = req.body;
    const DeleteStatus = 0;

    if (!AccountNumber || !Name || !TransactionType) {
        return res.status(400).send("Missing required fields");
    }

    // if (userRole != 2) {
    //     return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    // }
    
    try {
        const transaction = await createTransaction(AccountNumber, Name, TransactionType, DeleteStatus);
        res.status(201).send({ transaction });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

app.put("/update-transaction/:id", async (req, res) => {
    // const userRole = req.session.role;

    const { id } = req.params;

    const {AccountNumber, Name, TransactionType } = req.body;

    if (!AccountNumber || !Name || !TransactionType) {
        return res.status(400).send("Missing required fields");
    }

    // if (userRole != 2) {
    //     return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    // }

    try {
        const updatedTransaction = await updateTransaction(id,{AccountNumber, Name, TransactionType});
        if (!updatedTransaction) {
            return res.status(404).send("Transaction not found");
        }
        res.status(200).send({ updatedTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

app.get("/display-transactions", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    const token = req.session.user.token;
    const validResult = await verifiyToken(token);

    try {
        let transactions = []; // ✅ Declare transactions outside of the block

        if (validResult) {
            console.log("Token is legal");
            transactions = await displayTransactions(); // ✅ Assign transactions here
        } else {
            console.log("Token is not legal");
            return res.status(401).json({ message: "Invalid Token" });
        }
        console.log(req.session.user)
        res.status(200).json({ transactions }); // ✅ Send response after transactions is assigned

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
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







app.post("/create-user", async (req, res)=>{
    // const userRole = req.session.role;
    const {Name, LastName, Username, Password, TellerNumber} = req.body

    if (!Name || !LastName || !Username || !Password || !TellerNumber) {
        return res.status(400).send("Missing required fields");
    }

    // if(userRole !=2){
    //     return res.status(401).json({ message: 'User not admin error creating ' });
    // }

    try{
    const users = await createUser(Name, LastName, Username, Password, TellerNumber)
    res.status(201).send({users});
    }catch (error){
        console.error(error);
        res.status(500).send("internal server error")

    }
})



app.put("/update-user/:id", async (req, res) => {
    // const userRole = req.session.role;

    const { id } = req.params;

    const {Name, LastName, Username, Password} = req.body;

    if (!LastName || !Name || !Username || !Password) {
        return res.status(400).send("Missing required fields");
    }

    // if (userRole != 2) {
    //     return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    // }

    try {
        const updatedTransaction = await updateUser(id,{Name, LastName, Username, Password});
        if (!updatedTransaction) {
            return res.status(404).send("Transaction not found");
        }
        res.status(200).send({ updatedTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
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


  const ip = '192.168.10.245';
  const port = '8080';
  app.listen(port, ip, () => {
    console.log('running on 8080')
  })


