const mongoose = require("mongoose");

const imbOrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, index: true },
    user_id: { type: String, index: true },
    /** userTemps._id (string) — links OTP/temp row to this payment */
    user_temp_id: { type: String, index: true, default: null },
    app_id: { type: String, index: true },
    amount: { type: Number, default: 0 },
    user_token: { type: String, default: null },
    status: { type: String, default: "CREATED" },
    payment_status: { type: String, default: null },
    reference_id: { type: String, default: null },
    payment_url: { type: String, default: null },
    webhook_url: { type: String, default: null },
    last_response: { type: mongoose.Schema.Types.Mixed, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "imb_orders" }
);

module.exports = mongoose.model("ImbOrder", imbOrderSchema);
