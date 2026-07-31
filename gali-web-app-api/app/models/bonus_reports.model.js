const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number },
    user_id: { type: String },
    type: { type: String },
    transaction_id: { type: String },
    remark: { type: String },
    win_value: { type: Number },
    value_update_by: { type: String },
    app_id: { type: String },
    tr_nature: { type: String },
    tr_value: { type: Number },
    tr_value_updated: { type: Number },
    date: { type: String },
    date_time: { type: String },
    tr_status: { type: String },
    table_id: { type: String },
    tr_remark: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    login_url: { type: String, default: null },
  },
  { collection: "bonus_reports" }
);

module.exports = mongoose.model("bonus_reports", bookSchema);
