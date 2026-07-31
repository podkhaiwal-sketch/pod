const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
},{ collection: 'comx_appmarkets'});

module.exports = mongoose.model('ComxAppmarkets', bookSchema);