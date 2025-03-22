import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session';
import cors from 'cors';
import { createTransaction, updateTransaction,displayTransactions,deleteTransaction, createUser,updateUser } from './database.js';



//WHOEVER TAKES OVER THIS CODE PLEASE MAKE SURE TO CHANGE THE IP ADDRESS TO THE SERVER IP ADDRESS THIS CAN BE DONE ON THE LEFT
//SIDE OF VS CODE, BY CLICK THE SEARCH BUTTON AND CHOOSING REPLACE

//BEFORE PROCEEDING TO EDIT THE CODE BELOW PLEASE READ THE DOCUMENTATION ON THE BACKEND FOLDER, I PLACED A README FILE THERE


//I DONT KNOW HOW I WROTE THIS CODE BUT IT WORKS JUST FOLLOW THE PROPER BACKEND API CALLS AND YOU SHOULD BE FINE

// const express = require('express');
const app = express()

// app.use(cors());
app.use(bodyParser.json())



    

const corsOptions = {
    origin: "http://192.168.10.245:3000", // Allow your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Critical: Allows cookies to be sent
  };
  app.use(cors(corsOptions));



app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

app.use(
    session({
      secret: "your_secret_key",
      resave: false, // Avoid unnecessary session saves
      saveUninitialized: false, // Prevent empty sessions from being created
      cookie: {
        secure: false, // Set `true` if using HTTPS
        httpOnly: true, // Prevent client-side access
        sameSite: "Lax", // Required for cross-origin cookies
      },
    })
  );






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
    // const userRole = req.session.role;

    // if (userRole != 2) {
    //     return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    // }

    try {
        const transactions = await displayTransactions();
        res.status(200).send({ transactions });
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
    const userRole = req.session.role;
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









app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')

  })


  const ip = '192.168.10.245';
  const port = '8080';
  app.listen(port, ip, () => {
    console.log('running on 8080')
  })