const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
  user_id: { type: String},
  subadmin_id: { type: String},
  message: { type: String},
  name: { type: String},
  datetime: { type: String},
  mobile: { type: String},
  withdraw_message: { type: String},
  subadmin_name: { type: String},
  status: { type: Number},
  withdraw_seen_status: { type: Number},
  deposit: { type: Number},
  withdraw: { type: Number},
  created_at: { type: Date, default:Date.now}, 
  updated_at: { type: Date, default:Date.now}, 
},{ collection: 'chatMaster'});


module.exports = mongoose.model('chatMaster', bookSchema);