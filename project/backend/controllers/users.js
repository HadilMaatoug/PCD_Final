//
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
require('dotenv').config();
const auth=require('../services/authentication');
// const nodemailer = require('nodemailer');

//
//GET ALL OR ONES INFO
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
//

function values(x){
 
    console.log(x);
    const raisonS=x.raisonS;
    const matricule=x.matricule;
    const adresse=x.adresse;
    const email=x.email;
    const password=x.password;

    return [matricule, raisonS,  email, password];

};


exports.getAllUsers=(req,res)=>{
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    });
};

exports.signup = async (req, res) => {
    try {
        const val = values(req.body);
        const matricule = val[0];
        const password = val[3]; 
        
        // Check if a user with the same matricule exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE matricule = ?', [matricule]);

        if (existingUsers.length > 0) {
            return res.status(400).json({
                status: "fail",
                message: "User with this matricule already exists"
            });
        }
        //
        const hashedPassword = await bcrypt.hash(password, 12); // 12 is the salt rounds
        // Replace plain password with hashed password in val array
        val[3] = hashedPassword;
        // If no existing user, insert the new user
        const query = 'INSERT INTO users (Matricule, raisonSociale,  email, password) VALUES (?, ?, ?, ?)';
        const [result]=await pool.query(query, val);

        // res.status(201).json({
        //     status: "success",
        //     message : "successfully registered"
        // });
        const userResponse = { 
            matricule: matricule, 
            raisonS: val[1] // raisonSociale
        };
        const accessToken = jwt.sign(userResponse, process.env.SECRET_KEY, { expiresIn: '12h' });

        res.status(201).json({
            status: "success",
            token: accessToken,
            user: {
                matricule: matricule,
                raisonS: val[1],
                email: val[2]
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "fail",
            message: err
        });
    }
};
////////////////////////////
exports.login = async (req, res) => {
    try {
        const { matricule, password } = req.body;
        const query = 'SELECT * FROM users WHERE matricule = ?';
        const [result] = await pool.query(query, [matricule]);

        if (result.length <= 0) {
            return res.status(401).json({ message: "Incorrect username or password" });
        }

        const user = result[0];
        console.log(user);

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect username or password" });
        }

        // if (user.status === 'false') {
        //     return res.status(401).json({ message: "User account is inactive" });
        // }

        // Generate JWT token
        console.log('ACCESS_TOKEN:', process.env.SECRET_KEY);

        const response = { matricule: user.Matricule, raisonS: user.raisonSociale };
        const accessToken = jwt.sign(response, process.env.SECRET_KEY, { expiresIn: '12h' });
   


        res.status(200).json({
            status: "success",
            token: accessToken,
            user: {
                matricule: user.Matricule,
                raisonS: user.raisonSociale
            }
        });


    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

//////////////////////////////////////////
exports.getUser = async (req, res) => {
    // const matricule = req.params.matricule;
    console.log(res.locals);

    console.log(res.locals.user.matricule);
    const matricule = res.locals.user.matricule; // Use the matricule from the JWT payload

    try {
        const [result, fields] = await pool.query('SELECT * FROM users WHERE Matricule = ?', [matricule]);

        if (result.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: result  
        });
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

////////////////////////////////////////////////////
exports.updateUser = async (req, res) => {
    // const matricule = req.params.matricule;
    const matricule = res.locals.matricule; // Use the matricule from the JWT payload

    try {
        const updates = req.body;

        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updates), matricule]; // Append the matricule at the end of the values array

        const query = `UPDATE users SET ${fields} WHERE Matricule = ?`;
        const [result] = await pool.query(query, values);

        res.status(200).json({
            status: "success",
            data: result
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }
};



////////////////////////////////////////////////////
 exports.deleteUser=async (req,res)=>{
//     try {
//         const [result, fields] = await pool.query(`delete FROM fournisseurs where id=${id}`);
//         res.status(200).json({
//             status: "success",
//             data: result
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             message: err  
//         });
//     }
  
 };