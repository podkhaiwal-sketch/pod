const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
   name: {type:String},
   message: {type:String},
   user_id: {type:String},
   created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
},{ collection: 'groupMSg'});


module.exports = mongoose.model('groupMSg', bookSchema);