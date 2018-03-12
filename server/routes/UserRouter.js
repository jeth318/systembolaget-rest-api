var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var userCtrl = require('../controllers/UserController');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// CREATES A NEW USER
router.post('/', userCtrl.Create);

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', userCtrl.GetAll);

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', userCtrl.GetOne);

// DELETES A USER FROM THE DATABASE
router.delete('/:id', userCtrl.Remove);

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/:id', userCtrl.Modify);


module.exports = router;