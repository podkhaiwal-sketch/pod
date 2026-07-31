const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
},{ collection: 'results_tbls'});


module.exports = mongoose.model('resultTable', bookSchema);