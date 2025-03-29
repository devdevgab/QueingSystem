import jwt from 'jsonwebtoken';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZ2FicmllbCIsImlhdCI6MTc0MzA1MDMyNSwiZXhwIjoxNzQzMDUzOTI1fQ.cb8Qps29JKtbBk4rxUdPJ3UkUi4EjlRZekAhJYpx7pE";
const secretKey = "Francis"; 


// Use the actual secret key

try {
    const decoded = jwt.verify(token, secretKey);
    console.log("JWT is valid:", decoded);
} catch (err) {
    console.log("JWT is invalid:", err.message);
}


