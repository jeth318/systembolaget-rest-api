var mongoose = require('mongoose');  
const ProductSchema = new mongoose.Schema({
    nr: String,
    artikelid: String,
    varnummer: String,
    namn: String,
    namn2: String,
    prisinklmoms: Number,
    volymiml: Number,
    prisPerLiter: Number,
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
    argang: String,
    provadargang:  String,
    alkoholhalt: String,
    sortiment: String,
    sortimentText: String,
    ekologisk: Boolean,
    etiskt: Boolean,
    koscher: Boolean
});
mongoose.model('Product', ProductSchema, 'articles');

module.exports = mongoose.model('Product');

