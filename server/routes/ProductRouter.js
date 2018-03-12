// ProductRouter.js

/* CONFIG & IMPORTS */
var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var productCtrl = require('../controllers/productController');
var authCtrl = require('../controllers/authController');
/******************************************************/

/* MIDDLEWARE */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/******************************************************/

/* ROUTES */
// get - RETURN ALL PRODUCTS
router.get('/', productCtrl.GetAll);

// get - RETURN ONE PRODUCT
router.get('/:id', productCtrl.GetOne);

// post - RETURN COLLECTION MATCHING SEARCH CRITERIA
router.post('/custom', productCtrl.GetCustom);

// get - UPDATE ALL PRODUCTS
router.post('/update', authCtrl.VerifyToken, productCtrl.Update);

module.exports = router;