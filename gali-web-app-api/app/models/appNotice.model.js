const mongoose = require('mongoose');

const appNoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  is_display: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'app_notices' });

module.exports = mongoose.model('AppNotice', appNoticeSchema);
