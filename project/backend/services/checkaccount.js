// const pool = require('./../db'); 
const mysql = require ('mysql');
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'FineAce123@',
    database: 'mydb'
});
const mysql2 = require('mysql2/promise');

// Create a connection pool
const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'FineAce123@',
    database: 'mydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});// Ensure the correct path to your database pool

// Authorization middleware
const authorizeAccount = async (req, res, next) => {
    try {
        // Make sure the user is authenticated and has a matricule in the JWT
        if (!res.locals.user || !res.locals.user.matricule) {
            return res.status(401).json({
                status: "fail",
                message: "User not authenticated or matricule not found"
            });
        }

        const matricule = res.locals.user.matricule; // Use the matricule from the JWT payload

        // Extract id from request parameters
        const { id } = req.params;

        // Query the database to get the accounts field for the provided id
        const query = 'SELECT accounts FROM factures WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        // Check if the record exists
        if (result.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Facture not found"
            });
        }

        const accounts = result[0].accounts;

        // Check if accounts matches the matricule from the token
        if (accounts !== matricule) {
            return res.status(403).json({
                status: "fail",
                message: "Unauthorized: accounts do not match matricule"
            });
        }

        // Attach account to request object for further use (if needed)
        req.account = matricule;
        next();
    } catch (err) {
        console.error(err); // Log error for debugging
        res.status(401).json({
            status: "fail",
            message: "Authentication failed"
        });
    }
};

module.exports = { authorizeAccount };
