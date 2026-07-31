const mongoose = require('mongoose');
const usercoinSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number},
  money: { type: Number},
  transStatus: { type: String},
  upiId: { type: String},
  TranID: { type: String},
  TDate: { type: String},
  ip_address: { type: String},
  user_agent: { type: String},
  payload: { type: String},
  last_activity: { type: Number},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'usercoin' });
module.exports = mongoose.model('Usercoin', usercoinSchema);

