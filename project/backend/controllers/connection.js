const mysql = require ('mysql');
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb'
});
const mysql2 = require('mysql2/promise');

// Create a connection pool
const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});