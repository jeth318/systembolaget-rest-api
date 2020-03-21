// StoreRouter.js

/* CONFIG & IMPORTS */
var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var storeCtrl = require('../controllers/StoreController');
var authCtrl = require('../controllers/AuthController');
/******************************************************/

/* MIDDLEWARE */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/******************************************************/

/* ROUTES */
// get - RETURN ALL STORES
router.get('/', storeCtrl.GetAll);

// get - RETURN ONE STORE
router.get('/:id', storeCtrl.GetOne);

// post - RETURN COLLECTION MATCHING SEARCH CRITERIA
router.post('/custom', storeCtrl.GetCustom);

// get - UPDATE ALL STORES
router.post('/update', authCtrl.VerifyToken, storeCtrl.Update);

// get - UPDATE GOOGLE LOCATION FOR ALL STORES
router.post('/update/location', authCtrl.VerifyToken, storeCtrl.UpdateLocation);


module.exports = router;
