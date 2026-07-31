const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    id: {type:Number},
   view_date: {type:String},
   user_id: {type:String},
},{ collection: 'gamehost_seen'});


module.exports = mongoose.model('gamehostSeen', bookSchema);