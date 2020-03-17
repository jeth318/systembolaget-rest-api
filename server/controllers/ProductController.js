
var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
var Hash = require('../models/Hash');
const _ = require("lodash");
const parseString = require("xml2js").parseString;
const fs = require("fs");
var rp = require("request-promise");
var sha = require("sha256");
const remoteEndpoint = require('../endpoints');
const axios = require('axios');


// RETURNS ALL THE USERS IN THE DATABASE
function GetAll(req, res) {
  Product.find({}, function (err, products) {
    if (err) return errorHandler(res, err);
    res.status(200).json(products);
  });
}

// RETURNS CUSTOM PRODUCTS FROM THE DATABASE
function GetCustom(req, res) {
  console.log(req.body);
  
  console.log(req.body);
  let customQuery = {};
  Object.keys(req.body).forEach(function (prop) {
    customQuery[prop] = new RegExp((".*" + req.body[prop] + ".*"), "i");
  });

  Product.find(customQuery, function (err, products) {
    if (err) return errorHandler(res, err)
    res.status(200).send(products);
  })
    .limit(req.body["limit"] ? parseInt(req.body["limit"]) : null);

}

// GETS A SINGLE PRODUCT IN THE DATABASE
function GetOne(req, res) {
  Product.findById(req.params.id, function (err, product) {
    if (err) return errorHandler(res, err);
    if (!product) return res.status(404).send("No product found.");
    res.status(200).json(product);
  });
}

// DELETES A PRODUCT FROM THE DATABASE
function Remove(req, res) {
  Product.findByIdAndRemove(req.params.id, function (err, product) {
    if (err) return errorHandler(res, err);
    res.status(200).json({message: "Product: " + product.namn + " was deleted."});
  });
}

// GETS A PRODUCT IMAGE
async function GetImage(req, res) {
    if (!req.params.id) {
        return res.status(200).json({ message: 'Request OK but no image found for provided id' });
    }
    const config = {
        url: 'https://www.systembolaget.se/api/product/GetProductsForAnalytics',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ ProductNumbers:[req.params.id.toString()]})
    }

    try {
        const response = await axios(config);
        return res.status(200).json({imageUrl: response.data.Products[0].ImageItem[0].ImageUrl})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error })
    }
  }


// UPDATES ALL PRODUCTS IN THE DATABASE
function Update(req, res) {

  let backup = {};
  let oldProducts, newProducts, storedHash;
  const p1 = Product.find({});
  const p2 = rp(remoteEndpoint.PRODUCTS);
  const p3 = Hash.findOne({ 'type': 'products' })

  Promise.all([p1, p2, p3])
    .then((data) => {
      console.log('All initial promises resolved')
      oldProducts = data[0];
      newProducts = data[1];
      storedHash = data[2] ? data[2].hash : '';

      console.log(newProducts);
      
    
      const options = { explicitArray: false, normalizeTags: true, attrkey: "attr" };
      return new Promise((resolve, reject) => {
        console.log('Parsing XML...')
        parseString(newProducts, options, function (err, parsedData) {
          console.log('Done parsing XML...')
          console.log(parsedData)
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
            return Product.insertMany(prettyProducts(parsedXml))
          })
          .then(() => {
            console.log('Updating hash... ');
            return Hash.findOneAndUpdate({ 'type': 'products' }, { hash: sha(parsedXml), updatedAt: new Date() })
          })
          .then(() => {
            console.log('Update completed!');            
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
      return errorHandler(res, err)
    })
}

function prettyProducts(productCollection){
  return _.map(productCollection, (product)=>{
    product.alkoholhalt = product.alkoholhalt.slice(0, -1);
    product.id = product.nr;
    return product;
  })
}

function errorHandler(res, thrownError, customMessage){
  let description = 'There was a problem with the requested operation. ';
  if (customMessage) {
    description = customMessage;
  } 

  return res.status(500).json({error: description, explanation: thrownError})
}

module.exports = { GetAll, GetOne, Remove, Update, GetCustom, GetImage }