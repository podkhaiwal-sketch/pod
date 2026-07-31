const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
  bank_name: { type: String},
  account_holder: { type: String},
  account_no: { type: Number},
  user_id: { type: String},
  ifsc: { type: String},
  created_at: { type: Date, default:Date.now}, 
  updated_at: { type: Date, default:Date.now}, 
},{ collection: 'user_withdraw'});


module.exports = mongoose.model('user_withdraw', bookSchema);