const mongoose = require('mongoose');
const HashSchema = mongoose.Schema({
    type: String,
    hash: String,
    updatedAt: Date,
});
mongoose.model('Hash', HashSchema, 'hashs');

module.exports = mongoose.model('Hash');