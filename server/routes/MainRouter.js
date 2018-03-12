/* CONFIG & IMPORTS */
var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mainCtrl = require('../controllers/MainController');
/******************************************************/

/* MIDDLEWARE */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/******************************************************/

/* ROUTES */
router.get('/', mainCtrl.Main);
router.get('/funny', mainCtrl.Funny);

  
module.exports = router;