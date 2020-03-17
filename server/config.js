// config.js
require('dotenv').config();

module.exports = {
    'secret': process.env.SECRET,
    'db' : process.env.DB,
    'googleApiKey' : process.env.GOOGLE_API_KEY
  };