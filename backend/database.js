// import axios from 'axios';
import sql from 'mssql';
import dotenv from 'dotenv'
dotenv.config()

// const sql = require('mssql');

// const pool = mysql.createPool({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE
// }).promise()


const pool = new sql.ConnectionPool({
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    server: process.env.SQLSERVER_HOST,
    port: parseInt(process.env.SQLSERVER_PORT),
    database: process.env.SQLSERVER_DATABASE,
    options: {
        encrypt: true, // Use encryption (recommended for Azure SQL)
        trustServerCertificate: true // Set to true if using self-signed certificates
    }
});

// const poolConnect = pool.connect(); // Connect to the SQL Server database

pool.connect()
    .then(() => {
        console.log("Connected to SQL Server");
    })
    .catch(err => {
        console.error("Connection failed: ", err);
    });



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

export async function createUser(Name, LastName, Username, Password, TellerNumber){
    try {
        const result = await pool.request()
            .input('Name', sql.VarChar, Name)
            .input('LastName', sql.VarChar, LastName)
            .input('Username', sql.VarChar, Username)
            .input('Password', sql.VarChar, Password)
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
