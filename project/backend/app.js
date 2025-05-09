const fs = require('fs');
require('dotenv').config();
const express= require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mysql = require ('mysql');
const cors = require('cors');
// const FournisseurRouter = require('./routes/founisseursRoutes');
const UsersRouter = require('./routes/usersRoutes');
const CandidatesRouter = require('./routes/candidatesRoutes');
// const factureRouter = require('./routes/facturesRoutes');
// const chequeRouter = require('./routes/chequesRoutes');
// const pdfgenerate = require('./routes/pdfRoutes');


//
const app=express();
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
//
//connection
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb'
});
con.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('connected!!')
    }

});

// ///
//routers
// app.use('/api/v1/fournisseurs', FournisseurRouter);
app.use('/api/v1/user', UsersRouter);
app.use('/api/v1/cand', CandidatesRouter);
// app.use('/api/v1/facture',factureRouter);
// app.use('/api/v1/cheque',chequeRouter);
// app.use('/generateInvoice',pdfgenerate);


const port= 4000;
app.listen(port,()=>{
    console.log(`app running on port ${port}...`);

});

// module.exports = app;