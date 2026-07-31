const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    mob: { type: String },
    otp: { type: String },
    /** App user_id (linked after register / for payment flows) */
    user_id: { type: String, default: null },
    /** Last IMB payment order id tied to this temp row */
    imb_last_order_id: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "userTemps" }
);

module.exports = mongoose.model("userTemp", bookSchema);
