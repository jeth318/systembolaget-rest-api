var mongoose = require('mongoose');  
const StockSchema = new mongoose.Schema({
    store_id: String,
    availableProducts: [String]
});
mongoose.model('Stock', StockSchema, 'stocks');

module.exports = mongoose.model('Stock');

