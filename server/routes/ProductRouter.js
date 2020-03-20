// ProductRouter.js

/* CONFIG & IMPORTS */
var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var productCtrl = require('../controllers/ProductController');
var authCtrl = require('../controllers/AuthController');
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

// post - RETURN COLLECTION MATCHING SEARCH CRITERIA
router.get('/image/:id', productCtrl.GetImage);

// get - RETURN ONE PRODUCT
router.delete('/:id', productCtrl.Remove);

// get - UPDATE ALL PRODUCTS
router.post('/update', productCtrl.Update);

module.exports = router;
