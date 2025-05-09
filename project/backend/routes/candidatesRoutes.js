const express = require('express');
const auth=require('../services/authentication');

const candidatescontrollers = require('../controllers/candidates');


const Router = express.Router();
//
// Apply middleware first, then handler
Router.post('/upload', candidatescontrollers.uploadMiddleware, candidatescontrollers.upload);

// Change this to GET since you're fetching data
Router.get('/getAll', candidatescontrollers.getAll);


///
module.exports = Router;