// StockRouter.js

/* CONFIG & IMPORTS */
var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var stockCtrl = require('../controllers/StockController');
var authCtrl = require('../controllers/AuthController');
/******************************************************/

/* MIDDLEWARE */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/******************************************************/

/* ROUTES */
// get - RETURN ALL STOCKS
router.get('/', stockCtrl.GetAll);

// get - RETURN ONE STOCK
router.get('/:id', stockCtrl.GetOne);

// post - RETURN COLLECTION MATCHING SEARCH CRITERIA
router.post('/custom', stockCtrl.GetCustom);

// get - UPDATE ALL STOCKS
router.post('/update', authCtrl.VerifyToken, stockCtrl.Update);

// get - RETURN TRUE || FALSE IF STORE HAS PRODUCT IN STOCK
router.post('/availability', stockCtrl.Availability);

module.exports = router;
