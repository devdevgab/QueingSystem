import jwt from 'jsonwebtoken';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZ2FicmllbCIsImlhdCI6MTc0MzA1MDMyNSwiZXhwIjoxNzQzMDUzOTI1fQ.cb8Qps29JKtbBk4rxUdPJ3UkUi4EjlRZekAhJYpx7pE";
const secretKey = "Vt9@5G!kWz#17Np$eR4xUbM&LcQ2^HaZ";


// Use the actual secret key

try {
    const decoded = jwt.verify(token, secretKey);
    console.log("JWT is valid:", decoded);
} catch (err) {
    console.log("JWT is invalid:", err.message);
}


