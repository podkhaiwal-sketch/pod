const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number },
    userid: { type: String },
    is_forwared: { type: String },
    forwared_to: { type: String },
    type: { type: String },
    department: { type: String },
    chatType: { type: String },
    image: { type: String },
    message: { type: String },
    is_seen: { type: String },
    subadmin: { type: String },
    seen: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "chatting" }
);

module.exports = mongoose.model("chat", bookSchema);
