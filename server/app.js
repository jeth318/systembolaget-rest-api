var express = require('express');
var app = express();
var db = require('./db');
var cookieParser = require('cookie-parser')

app.use(cookieParser());

app.get('/', (req, res)=>{
    res.sendFile(__dirname+ '/index.html');
})

var UserRouter = require('./routes/UserRouter');
app.use('/users', UserRouter);

// app.js
var AuthRouter = require('./routes/AuthRouter');
app.use('/api/auth', AuthRouter);

var ProductRouter = require('./routes/ProductRouter');
app.use('/products', ProductRouter);

var StoreRouter = require('./routes/StoreRouter');
app.use('/stores', StoreRouter);

module.exports = app;