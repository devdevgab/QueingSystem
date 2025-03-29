// import axios from 'axios';
import bcrypt from 'bcryptjs';
import sql from 'mssql';
import dotenv from 'dotenv';
import os from "os";
import jwt from 'jsonwebtoken';
dotenv.config();

const pool = new sql.ConnectionPool({
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    server: process.env.SQLSERVER_HOST,
    port: parseInt(process.env.SQLSERVER_PORT),
    database: process.env.SQLSERVER_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
});

// const poolConnect = pool.connect(); // Connect to the SQL Server database

pool.connect()
    .then(() => console.log("Connected to SQL Server"))
    .catch(err => console.error("Connection failed:", err));


  

    export async function validateUser(Username, Password) {
        try {
            const result = await pool.request()
                .input('Username', sql.VarChar, Username)
                .query(`SELECT * FROM tbl_Users WHERE Username = @Username`);
    
            if (result.recordset.length === 0) return null; // User not found
    
            const user = result.recordset[0];
    
            // Compare hashed password
            const isMatch = await bcrypt.compare(Password, user.Password);
            if (!isMatch) return null;
    
            return user;
        } catch (error) {
            throw error;
        }
    }
export async function verifiyToken(result){
    const secretToken = "heehehe"
    try {
        const decoded = jwt.verify(result,process.env.JWT_SECRET );
        console.log("JWT is valid:", decoded);
        const answer = true
        return answer
    } catch (err) {
        console.log("JWT is invalid:", err.message, "hmmm", result);
        const answer = false
        return answer
    }
}



export async function createTransaction(AccountNumber, Name, TransactionType,DeleteStatus) {
    try {
        const result = await pool.request()
            .input('AccountNumber', sql.VarChar, AccountNumber)
            .input('Name', sql.VarChar, Name)
            .input('TransactionType', sql.VarChar, TransactionType)
            .input('DeleteStatus', sql.Int, DeleteStatus || 0) // Set initial value of 0 if DeleteStatus is not provided
            .query(`
            INSERT INTO tbl_Transactions (AccountNumber, Name, TransactionType, DeleteStatus)
            VALUES (@AccountNumber, @Name, @TransactionType, @DeleteStatus);
            SELECT SCOPE_IDENTITY() AS TransactionId;
            `);

        return result.recordset[0];
    } catch (error) {
        throw error;
    }
}


export async function updateTransaction(ID, {AccountNumber, Name, TransactionType}) {
    try {
     

        const result = await pool.request()
            .input('AccountNumber', sql.VarChar, AccountNumber) // Retained VARCHAR
            .input('Name', sql.VarChar, Name)
            .input('TransactionType', sql.VarChar, TransactionType)
            .input('ID', sql.Int, ID)
            .query(`
                UPDATE tbl_Transactions
                SET AccountNumber = @AccountNumber,
                    Name = @Name,
                    TransactionType = @TransactionType
                WHERE ID = @ID;

                SELECT * FROM tbl_Transactions WHERE ID = @ID;
            `);

        return result.recordset.length > 0 ? result.recordset[0] : null; // Return updated record or null if not found
    } catch (error) {
        throw error;
    }
}
export async function displayTransactions(){
    try{
    const result = await pool.request()
    .query(
        `SELECT * FROM tbl_Transactions`

    );
    return result.recordset
    }
    catch(error){
        throw error;
    }

}

export async function deleteTransaction(id, {DeleteStatus}){
    try {
        const result = await pool.request()
            .input('DeleteStatus', sql.Int, DeleteStatus)
            .input('ID', sql.Int, id)
            .query(`
                UPDATE tbl_Transactions
                SET DeleteStatus = @DeleteStatus
                WHERE (ID = @ID)`
            );

        return result.rowsAffected > 0; // Return true if rows were affected
    } catch (error) {
        throw error;
    }
}

export async function createUser(Name, LastName, Username, Password, TellerNumber) {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10); // Hash password

        const result = await pool.request()
            .input('Name', sql.VarChar, Name)
            .input('LastName', sql.VarChar, LastName)
            .input('Username', sql.VarChar, Username)
            .input('Password', sql.VarChar, hashedPassword) // Store hashed password
            .input('TellerNumber', sql.Int, TellerNumber)
            .query(`
                INSERT INTO tbl_Users (Name, LastName, Username, Password, TellerNumber)
                VALUES (@Name, @LastName, @Username, @Password, @TellerNumber);
                SELECT SCOPE_IDENTITY() AS UserId;
            `);

        return result.recordset[0];
    } catch (error) {
        throw error;
    }
}

export async function updateUser(ID, {Name, LastName, Username, Password}) {
    try {
     

        const result = await pool.request()
            .input('Name', sql.VarChar, Name) // Retained VARCHAR
            .input('LastName', sql.VarChar, LastName)
            .input('Username', sql.VarChar, Username)
            .input('Password', sql.VarChar, Password)
            .input('ID', sql.Int, ID)
            .query(`
                UPDATE tbl_Users
                SET Name = @Name,
                    LastName = @LastName,
                    Username = @Username,
                    Password = @Password
                WHERE ID = @ID;

                SELECT * FROM tbl_Users WHERE (ID = @ID);
            `);

        return result.recordset.length > 0 ? result.recordset[0] : null; // Return updated record or null if not found
    } catch (error) {
        throw error;
    }
}

export const getUserIP = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    return forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;
  };
  
  // Function to check if the user is Teller One
export const lockIP = (req) => {
    const deviceIP = getUserIP(req);
    const tellerOne ="192.168.10.62";
    const tellerTwo ="192.168.10.166";
    const tellerThree ="192.168.10.51";
    const tellerFour ="192.168.10.61";

    if (deviceIP === tellerOne) {
      return "Device is Teller One";


    } else if (deviceIP === tellerTwo) {
      return "Device is Teller Two";
      
    } else if (deviceIP === tellerThree) {
      return "Device is Teller Three";
      
    } else if (deviceIP === tellerFour) {
      return "Device is Teller Four";
      
    }else{
        return "Device is not a Teller Machine";
    }
  };