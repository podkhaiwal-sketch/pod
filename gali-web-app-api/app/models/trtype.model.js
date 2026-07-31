const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
},{ collection: 'tr_type'});

module.exports = mongoose.model('TrType', bookSchema);