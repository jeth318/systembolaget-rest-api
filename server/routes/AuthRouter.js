// AuthRouter.js

/* CONFIG & IMPORTS */
var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var authCtrl = require('../controllers/authController');
/******************************************************/

/* MIDDLEWARE */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/******************************************************/

/* ROUTES */
// post - REGISTER NEW USER
router.post('/register', authCtrl.Register);

// post - LOG IN USER
router.post('/login', authCtrl.Login);

// get - RETURN LOGGED IN USER
router.get('/me', authCtrl.VerifyToken, authCtrl.Me);

module.exports = router;