
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
    if (err) return res.status(500).send("There was a problem finding the products." + err);
    res.status(200).json({products});
  });
}

// RETURNS CUSTOM PRODUCTS FROM THE DATABASE
function GetCustom(req, res) {
  console.log(req.body);
  let customQuery = {};
  Object.keys(req.body).forEach(function (prop) {
    customQuery[prop] = new RegExp(".*" + req.body[prop] + ".*");
  });

  Product.find(customQuery, function (err, products) {
    if (err) return res.status(500).send("There was a problem finding the products." + err);
    res.status(200).send(products);
  })
    .limit(req.body["limit"] ? parseInt(req.body["limit"]) : null);

}

// GETS A SINGLE USER IN THE DATABASE
function GetOne(req, res) {
  Product.findById(req.params.id, function (err, product) {
    if (err) return res.status(500).send("There was a problem finding the product." + err);
    if (!product) return res.status(404).send("No product found.");
    res.status(200).json({product});
  });
}

// DELETES A PRODUCT FROM THE DATABASE
function Remove(req, res) {
  Product.findByIdAndRemove(req.params.id, function (err, product) {
    if (err) return res.status(500).send("There was a problem deleting the product." + err);
    res.status(200).json({message: "Product: " + product.name + " was deleted."});
  });
}


// UPDATES ALL PRODUCTS IN THE DATABASE
function Update(req, res) {

  const url = `https://www.systembolaget.se/api/assortment/products/xml`
  let backup = {};
  let oldProducts, newProducts, storedHash;
  const p1 = Product.find({});
  const p2 = rp(url);
  const p3 = Hash.findOne({ 'type': 'products' })

  Promise.all([p1, p2, p3])
    .then((data) => {
      console.log('All initial promises resolved')
      oldProducts = data[0];
      newProducts = data[1];
      storedHash = data[2].hash;
    
      const options = { explicitArray: false, normalizeTags: true, attrkey: "attr" };
      return new Promise((resolve, reject) => {
        console.log('Parsing XML...')
        parseString(newProducts, options, function (err, parsedData) {
          console.log('Done parsing XML...')
          err ? reject(err) : resolve(parsedData)
        });
      })
    })
    .then((parseResult) => {
      const parsedXml = parseResult.artiklar.artikel;
      console.log('Checking hash...')
      // Compares hash of new products to current stored hash. Ignores update if match.
      if (sha(parsedXml) === storedHash) {
        return 'No need to update';
      } else {
        console.log('Removing current products...')
        return Product.remove({})
          .then(() => {
            console.log('Inserting new products...')
            return Product.insertMany(parsedXml)
          })
          .then(() => {
            console.log('Updating hash... ');
            return Hash.findOneAndUpdate({ 'type': 'products' }, { hash: sha(parsedXml), updatedAt: new Date() })
          })
          .then(() => {
            console.log('Hash updated...');
            return 'Update completed!'
          })
        }
    })
    .then((message) => {
      console.log(message); 
      return res.status(200).json({message})
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({error: "There was a problem updating the products. ", explanation: err})
    })
}

module.exports = { GetAll, GetOne, Remove, Update, GetCustom }