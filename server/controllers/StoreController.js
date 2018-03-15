
var express = require('express');
var router = express.Router();
var Store = require('../models/Store');
var Hash = require('../models/Hash');
const _ = require("lodash");
const parseString = require("xml2js").parseString;
const fs = require("fs");
var rp = require("request-promise");
var sha = require("sha256");
var fetch = require('fetch');
var request = require('request');
var limit = require("simple-rate-limiter");
var googleApiKey = require('../config').googleApiKey;

//console.log(googleApiKey);

// RETURNS ALL THE STORES IN THE DATABASE
function GetAll(req, res) {
  console.log('YEpp')
  Store.find({}, function (err, stores) {
    if (err) return res.status(500).send("There was a problem finding the stores." + err);
    res.status(200).json(stores);
    return stores;
  });
}

// RETURNS CUSTOM STORES FROM THE DATABASE
function GetCustom(req, res) {
  let customQuery = {};
  Object.keys(req.body).forEach(function (prop) {
    customQuery[prop] = new RegExp(".*" + req.body[prop] + ".*");
  });

  Store.find(customQuery, function (err, stores) {
    if (err) return res.status(500).send("There was a problem finding the stores." + err);
    res.status(200).send(stores);
  })
    .limit(req.body["limit"] ? parseInt(req.body["limit"]) : null);

}

// GETS A SINGLE STORE IN THE DATABASE
function GetOne(req, res) {
  Store.findById(req.params.id, function (err, store) {
    if (err) return res.status(500).send("There was a problem finding the store." + err);

    convertToWSG82(store.address);    
    if (!store) return res.status(404).send("No store found.");
    res.status(200).json({store});
  });
}

// DELETES A STORE FROM THE DATABASE
function Remove(req, res) {
  Store.findByIdAndRemove(req.params.id, function (err, store) {
    if (err) return res.status(500).send("There was a problem deleting the store." + err);
    res.status(200).json({message: "Store: " + store.name + " was deleted."});
  });
}


// UPDATES ALL STORES IN THE DATABASE
function Update(req, res) {

  const url = `https://www.systembolaget.se/api/assortment/stores/xml`
  let backup = {};
  let oldStores, newStores, storedHash;
  const p1 = Store.find({});
  const p2 = rp(url);
  const p3 = Hash.findOne({ 'type': 'stores' })

  Promise.all([p1, p2, p3])
    .then((data) => {
      console.log('All initial promises resolved')
      
      oldStores = data[0];
      newStores = data[1];
      storedHash = data[2].hash;
      backup = oldStores;
    
      const options = { explicitArray: false, normalizeTags: true, attrkey: "attr" };
      return new Promise((resolve, reject) => {
        console.log('Parsing XML...')
        parseString(newStores, options, function (err, parsedData) {
          console.log('Done parsing XML...')
          err ? reject(err) : resolve(parsedData)
        });
      })
    })
    .then((parseResult) => {
      const parsedXml = parseResult.butikerombud.butikombud;
      
      console.log('Checking hash...')
      // Compares hash of new stores to current stored hash. Ignores update if match.
      if (sha(parsedXml) !== storedHash) {
        return 'No need to update';
      } else {
        console.log('Removing current stores...')
        return Store.remove({})
          .then(() => {
            console.log('Formattin new stores...')
            return prettifyStores(parsedXml)
          })
          .then((storesWithCoordinates)=>{
            console.log(storesWithCoordinates)
            console.log('Inserting new stores...')
            return Store.insertMany(storesWithCoordinates)
          })
          .then((stores) => {
            console.log('Updating hash... ');
            return Hash.findOneAndUpdate({ 'type': 'stores' }, { hash: sha(parsedXml), updatedAt: new Date() })
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
        Store.insertMany(backup);
        return res.status(500).json({error: "There was a problem updating the stores. Restored db from backup.", err})
    })

}

function UpdateLocation(req, res) {
  var backup = [];
  var newStores = [];
  Store.find({}, (err, stores)=>{
    backup = stores;
    const promises = _.map(stores, (store)=>{
      return new Promise((resolve, reject)=>{
        callGoogleApi(store, function(err, response, body){
          if (err) {reject(err)}
          const finalRes = JSON.parse(body);
          if (finalRes.results[0]) {
            console.log(finalRes.results[0])            
            store.location.lat = finalRes.results[0].geometry.location.lat;
            store.location.lng = finalRes.results[0].geometry.location.lng;
          } 
          resolve(store)
        });
      })
    });

    Promise.all(promises)
    .then((output)=>{
      console.log(output);
      newStores = output;
      return Store.remove({})
    })
    .then(()=>{return Store.insertMany(newStores)})
    .then(()=>res.status(200).json({message: 'Location update successful'}))
    .catch(()=>{
      Store.insertMany(backup);
      res.status(500).json({error: 'Failed to update locations. Restore db from backup', explanation: err})
    })
  })
}

/************* PRIVATE FUNCTIONS **************/

function prettifyStores(stores) {
  
  return new Promise((resolve, reject)=>{
    const prettyFied = _.map(stores, (store)=>{
      return {
          type: store.typ,
          id: store.nr,
          name: store.namn,
          address: {
              street: store.address1,
              street2: store.address2,
              zipCode: store.address3,
              city: _.capitalize(store.address4),
              area: store.address5
          },
          phone: store.telefon,
          storeType: store.butikstyp,
          services: store.tjanster,
          searchTags: store.sokord ? store.sokord.split(';') : null,
          openHours: store.oppettider ? formatOpenHours(store.oppettider.split('*')) : null,
          locationRT90: {
              rt90y: store.rt90y,
              rt90x: store.rt90x,
          }
      }
  })
    resolve(prettyFied);
  })
   
}

function formatOpenHours(openHours) {
  return _.map(openHours, (oh)=>{
    return {
            date: oh.split(';')[0],
            opening: oh.split(';')[1],
            closing: oh.split(';')[2]
        }
    })
}


// Custom google request with rate-limiter. Max allowed API-calls is 40req/s.
var callGoogleApi = limit(function(store, callback) {

  const googleBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  let url = googleBaseUrl;
    url += '?country=SE' // TODO: Use address.country to get correct land code
    url += '&address=' + encodeURIComponent(`${store.address.street},+${store.address.zipCode}+${store.address.city}`)
    url += '&key=' + googleApiKey;
    url += '&v=3';

  request(url, callback);
}).to(35).per(1000);


module.exports = { GetAll, GetOne, Remove, Update, UpdateLocation, GetCustom }