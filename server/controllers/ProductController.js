var express = require('express');
var router = express.Router();
var Product = require('../models/Product');


// RETURNS ALL THE USERS IN THE DATABASE
function GetAll(req, res) {
    Product.find({}, function (err, products) {
        if (err) return res.status(500).send("There was a problem finding the products.");
        res.status(200).send(products);
    });
}

// RETURNS CUSTOM PRODUCTS FROM THE DATABASE
function GetCustom(req, res) {

    let customQuery = {};
    Object.keys(req.body).forEach(function(prop) {
        customQuery[prop] = new RegExp(".*" + req.body[prop] + ".*");
    });

    Product.find(customQuery, function (err, products) {
        if (err) return res.status(500).send("There was a problem finding the products.");
        res.status(200).send(products);
    })
    .limit(req.body["limit"] ? parseInt(req.body["limit"]) : null);
    
}

// GETS A SINGLE USER IN THE DATABASE
function GetOne(req, res) {
    console.log(req);
    Product.findById(req.params.id, function (err, product) {
        if (err) return res.status(500).send("There was a problem finding the product.");
        if (!product) return res.status(404).send("No product found.");
        res.status(200).send(product);
    });
}

// DELETES A PRODUCT FROM THE DATABASE
function Remove (req, res) {
    Product.findByIdAndRemove(req.params.id, function (err, product) {
        if (err) return res.status(500).send("There was a problem deleting the product.");
        res.status(200).send("Product: "+ product.name +" was deleted.");
    });
}


// UPDATES ALL PRODUCTS IN THE DATABASE
function Update(req, res) {
    Product.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, product) {
        if (err) return res.status(500).send("There was a problem updating the product.");
        res.status(200).send(product);
    });
}

module.exports = { GetAll, GetOne, Remove, Update, GetCustom, }