var mongoose = require('mongoose');  
const ProductSchema = new mongoose.Schema({
    id: String,
    artikelid: Number,
    varnummer: Number,
    namn: String,
    namn2: String,
    prisinklmoms: Number,
    volymiml: Number,
    perperliter: Number,
    saljstart: Date,
    utgått: Boolean,
    varugrupp: String,
    typ: String,
    stil: String,
    forpackning: String,
    forslutning: String,
    ursprung: String,
    ursprunglandnamn: String,
    producent: String,
    leverantor: String,
    argang: Number,
    provadargang:  String,
    alkoholhalt: Number,
    sortiment: String,
    sortimentText: String,
    ekologisk: Boolean,
    etiskt: Boolean,
    koscher: Boolean,
    ravarorbeskrivning: String
});
mongoose.model('Product', ProductSchema, 'products');

module.exports = mongoose.model('Product');

