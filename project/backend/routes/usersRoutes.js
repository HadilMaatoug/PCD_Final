const express = require('express');
const auth=require('../services/authentication');

const userscontrollers = require('./../controllers/users');
const Router = express.Router();
//

Router.route('/signup').post(userscontrollers.signup)
Router.route('/login').post(userscontrollers.login)


Router.route('/')
    .get(auth.authenticateToken, userscontrollers.getUser)
    .patch(auth.authenticateToken, userscontrollers.updateUser)
    .delete(auth.authenticateToken, userscontrollers.deleteUser);
///
module.exports = Router;