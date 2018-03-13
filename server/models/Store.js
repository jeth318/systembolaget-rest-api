const mongoose = require('mongoose');
const StoreSchema = mongoose.Schema({
    type: String,
    id: String,
    name: String,
    address: {
        street: String,
        street2: String,
        zipCode: String,
        city: String,
        area: String,
    },
    phone: String,
    storeType: String,
    services: String,
    searchTags: [],
    openHours: [
        {
            date: String,
            opening: String,
            closing: String,
        }
    ],
    location: {
        rt90x: Number,
        rt90y: Number
    }
});

mongoose.model('Store', StoreSchema, 'stores');

module.exports = mongoose.model('Store');