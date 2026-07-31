const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number },
    game_type: { type: String, default: null },
    app_id: { type: String },
    user_id: { type: String },
    tr_nature: { type: String },
    win_value: { type: Number, default: 0 },
    tr_value: { type: Number, default: 0 },
    type: { type: String },
    value_update_by: { type: String },
    tr_value_updated: { type: Number, default: 0 },
    date: { type: String },
    date_time: { type: String, default: Date.now },
    tr_status: { type: String },
    tr_remark: { type: String },
    table_id: { type: String, default: null },
    transaction_id: { type: String },
    is_win: { type: Number, default: 0 },
    is_transfer: { type: String, default: null },
    transfer_user_id: { type: String, default: null },
    pred_num: { type: String, default: null },
    upi_txn_id: { type: String, default: null },
    betLimitStatus: { type: Number, default: 0 },
    is_payout_pending: { type: Number, default: 0 },
    is_deleted: { type: Number, default: 0 },
    checked_by: { type: String, default: null },
    req_id: { type: String, default: null },
    btype: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    login_url: { type: String, default: null },
  },
  { collection: "wallet_reports" }
);

module.exports = mongoose.model("walletReport", bookSchema);
