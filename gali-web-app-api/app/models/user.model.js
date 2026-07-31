const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number },
    user_id: { type: String },
    app_id: { type: String },
    FullName: { type: String },
    mob: { type: String },
    us_pass: { type: String, default: null },
    us_gender: { type: String, default: null },
    credit: { type: Number, default: 0 },
    image: { type: String, default: null },
    bonus_diamonds: { type: Number, default: 0 },
    ref_code: { type: String, default: null },
    ref_by: { type: String, default: null },
    is_ref_enabled: { type: Number, default: 1 },
    ref_bonous: { type: Number, default: 0 },
    lat: { type: String, default: null },
    long: { type: String, default: null },
    long: { type: String, default: null },
    address: { type: String, default: null },
    dev_name: { type: String, default: null },
    device_id: { type: String },
    user_status: { type: Number, default: 1 },
    reg_date: { type: String, default: null },
    last_login: { type: String, default: null },
    last_active: { type: String, default: null },
    banned: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    prev_pass: { type: String, default: null },
    is_child: { type: Number, default: 0 },
    is_ref_check: { type: Number, default: 0 },
    win_amount: { type: Number, default: 0 },
    last_seen: { type: Date },
    is_playstore: { type: Number, default: 0 },
    login_token: { type: String },
    last_seen_date_time: { type: String, default: null },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "us_reg_tbl" }
);

module.exports = mongoose.model("User", bookSchema);
