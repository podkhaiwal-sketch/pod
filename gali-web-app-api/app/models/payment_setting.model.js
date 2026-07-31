const mongoose = require('mongoose');
const payment_settingSchema = new mongoose.Schema({
  id: { type: Number },
  getaway: { type: String}, 
  min_v: { type: Number,Default:null},
  status: { type: Number,Default:0},
  is_view: { type: Number,Default:0},
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'payment_getways' });
module.exports = mongoose.model('PaymentSetting', payment_settingSchema);

