var cookieParser = require('cookie-parser');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

function Main(req, res) {
    User.findById(req.userId, { password: 0 }, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        
        res.status(200).send(user);
      });
  }
  
  function Funny(req, res) {
    if (!req.cookies['token']) return res.status(403).send({msg: 'Not authenticated'})
      res.status(200).send({msg: 'Funnybunny'});
}
  module.exports = {Main, Funny};