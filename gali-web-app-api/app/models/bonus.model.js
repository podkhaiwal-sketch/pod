const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
   id: {type:Number},
  user_id: { type: String},
  played: { type: Number},
  bonus: { type: Number},
  market_id: { type: String},
  created_at: { type: Date, default:Date.now}, 
  updated_at: { type: Date, default:Date.now}, 
},{ collection: 'bonus'});


module.exports = mongoose.model('bonus', bookSchema);