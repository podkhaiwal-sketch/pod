const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
},{ collection: 'tbl_types'});

module.exports = mongoose.model('TblTypes', bookSchema);