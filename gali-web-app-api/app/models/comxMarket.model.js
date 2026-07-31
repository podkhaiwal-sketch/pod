const mongoose = require('mongoose');

const comxMarketSchema = new mongoose.Schema({
  market_name: { type: String},
  market_id: { type: String },
  market_view_time_open: { type: String },
  market_view_time_close: { type: String },
  market_sunday_time_open: { type: String },
  market_sunday_time_close: { type: String },
  is_holiday: { type: Boolean, default: false },
  updated_time_date: { type: Date, default: Date.now },
  status: { type: Number },
  is_time_limit_applied: { type: Boolean, default: false },
  is_no_limit_game: { type: Boolean, default: false },
  close_by_admin: { type: Boolean, default: false },
  market_type: { type: String },
  market_sub_name: { type: String },
  market_sunday_off: { type: Boolean, default: false },
  market_status: { type: String },
  app_id: { type: String, required: true },
  market_position: { type: Number },
  agent_id: { type: String },
  is_deleted: { type: Boolean, default: false }
}, { collection: 'comx_appmarkets' });

module.exports = mongoose.model('comxMarket', comxMarketSchema);
