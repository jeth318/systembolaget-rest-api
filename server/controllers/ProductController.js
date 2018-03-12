var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
var Hash = require('../models/Hash');
const _ = require("lodash");
const parseString = require("xml2js").parseString;
const fs = require("fs");
var rp = require("request-promise");
var sha = require("sha256");


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
    Object.keys(req.body).forEach(function (prop) {
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
    Product.findById(req.params.id, function (err, product) {
        if (err) return res.status(500).send("There was a problem finding the product.");
        if (!product) return res.status(404).send("No product found.");
        res.status(200).send(product);
    });
}

// DELETES A PRODUCT FROM THE DATABASE
function Remove(req, res) {
    Product.findByIdAndRemove(req.params.id, function (err, product) {
        if (err) return res.status(500).send("There was a problem deleting the product.");
        res.status(200).send("Product: " + product.name + " was deleted.");
    });
}


// UPDATES ALL PRODUCTS IN THE DATABASE
function Update(req, res) {

const url = `https://www.systembolaget.se/api/assortment/products/xml`
let firstLevel = 'artiklar';
let secondLevel = 'artikel';
let backup = {};

var p1 = Product.find({});
var p2 = rp(url);
var p3 = Hash.findOne({ 'type': 'products' })
var p4 = Product.remove({});
var oldProducts;
var newProducts;
var storedHash;
var parsedXml;

Promise.all([p1, p2, p3, p4])
  .then((data) => {
    console.log('All initial promises resolved')
    oldProducts = data[0];
    newProducts = data[1];
    storedHash = data[2].hash;
    
    const options = { explicitArray: false, normalizeTags: true, attrkey: "attr" };            
    return new Promise((resolve, reject) => {
    console.log('Parsing XML...')
      parseString(newProducts, options, function (err, jsonParsed) {
          console.log('Done parsing XML...')
          
          err ? reject(err) : resolve(jsonParsed[firstLevel][secondLevel])
      });
    })
  })
  .then((result) => {
    parsedXml = result;
    console.log('Checking hash...')
    if (sha(parsedXml) === storedHash) {
      return 'No need to update';
    } else {
      return Product.insertMany(parsedXml);
    }
  })
  .then((message) => {console.log('Hej1'); return Hash.findOneAndUpdate({ 'type': 'products' }, { hash: sha(parsedXml) })})
  .then((message) => {console.log('Hej2'); return res.status(200).send(message)})
  .catch((err) => res.status(500).send("There was a problem updating the products. " + err))
}

module.exports = { GetAll, GetOne, Remove, Update, GetCustom }