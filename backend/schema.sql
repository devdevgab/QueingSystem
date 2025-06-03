-- Account Number: 
-- Name: 
-- Date: 
-- Transaction Type: Withdrawal, Deposit, Collection, Disbursement

CREATE DATABASE db_QueuingSystem;

USE QueuingSystem;

DROP TABLE IF EXISTS tbl_Transactions;

CREATE TABLE tbl_Transactions (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    AccountNumber INT NULL,
    Name NVARCHAR(100) NULL,
    TransactionType NVARCHAR(50) NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE tbl_Transactions (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    AccountNumber INT NULL,
    Name NVARCHAR(100) NULL,
    TransactionType NVARCHAR(50) NULL,
    created DATETIME2 DEFAULT GETDATE()
);
ALTER TABLE tbl_Transactions
ADD DeleteStatus INT NULL;


CREATE TABLE tbl_Users(
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100) NULL,
    LastName VARCHAR(100) NULL,
    Username VARCHAR(50) NULL,
    Password VARCHAR(50) NULL,
    TellerNumber INT(10) NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)


ALTER TABLE tbl_Transactions
ADD Amount INT NULL;


ALTER TABLE tbl_Transactions
ADD Status VARCHAR(255) NULL;

ALTER TABLE tbl_Transactions
ADD AccountType VARCHAR(50) NULL;

ALTER TABLE tbl_Transactions
ADD DepositType VARCHAR(50) NULL;

ALTER TABLE tbl_Transactions
ADD PaymentType VARCHAR(50) NULL;

ALTER TABLE tbl_Transactions
ADD DisbursementType VARCHAR(50) NULL;
