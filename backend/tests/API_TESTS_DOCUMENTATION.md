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