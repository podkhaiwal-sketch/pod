const mongoose = require('mongoose');
const broadcastSeenSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: String },
  view_date: { type: String },
  b_id: { type: String},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'broadcast_seen' });
module.exports = mongoose.model('BroadcastSeen', broadcastSeenSchema);

