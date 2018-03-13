// AuthController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');


function Register(req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    User.create({
      name : req.body.name,
      email : req.body.email,
      password : hashedPassword
    },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user.")
      // create a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token });
    }); 
  }

  function Login(req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send({error: 'Error on the server.'});
      if (!user) return res.status(404).send({error: 'No user found.'});
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 900000 // expires in 24 hours
      });
        res.cookie('token', token, { maxAge: 900000, httpOnly: true })      
      res.status(200).send({ auth: true, token: token, decoded: jwt.decode(token) });
    });
  }

  function Me(req, res, next) {
    User.findById(req.userId, { password: 0 }, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("No user found.");
      
      res.status(200).send(user);
    });
  }

    /** TOKEN VERIFICATION METHOD **/

    function VerifyToken(req, res, next) {
      var token = req.headers['x-access-token'];
      if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err)
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        next();
      });
    }

module.exports = {Register, Login, Me, VerifyToken};