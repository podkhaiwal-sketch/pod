const mongoose = require('mongoose');
const boardcastsSchema = new mongoose.Schema({
  // id: { type: Number },
  status: { type: Number },
  seen: { type: Number },
  title: { type: String },
  description: { type: String },
  link: { type: String },
  media: { type: String },
  type: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'boardcasts' });
module.exports = mongoose.model('Boardcasts', boardcastsSchema);

