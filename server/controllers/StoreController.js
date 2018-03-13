
var express = require('express');
var router = express.Router();
var Store = require('../models/Store');
var Hash = require('../models/Hash');
const _ = require("lodash");
const parseString = require("xml2js").parseString;
const fs = require("fs");
var rp = require("request-promise");
var sha = require("sha256");


// RETURNS ALL THE STORES IN THE DATABASE
function GetAll(req, res) {
  Store.find({}, function (err, stores) {
    if (err) return res.status(500).send("There was a problem finding the stores." + err);
    res.status(200).json({stores});
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
      if (sha(parsedXml) === storedHash) {
        return 'No need to update';
      } else {
        console.log('Removing current stores...')
        return Store.remove({})
          .then(() => {
            console.log('Inserting new stores...')
            return Store.insertMany(prettifyStores(parsedXml))
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

function prettifyStores(stores) {
   return _.map(stores, (store)=>{
        return {
            type: store.butik,
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
            location: {
                rt90y: store.rt90y,
                rt90x: store.rt90x
            }
        }
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

module.exports = { GetAll, GetOne, Remove, Update, GetCustom }