const mongoose = require('mongoose');
const HashSchema = mongoose.Schema({
    type: String,
    hash: String,
    updatedAt: Date,
});
mongoose.model('Product', ProductSchema);

module.exports = mongoose.model('Hash');