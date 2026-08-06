const mongoose = require("mongoose");

const rouletteBetSchema = new mongoose.Schema(
  {
    round_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    number: { type: Number, required: true, min: 0, max: 9 },
    amount: { type: Number, required: true, min: 1 },
    payout: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "won", "lost", "refunded"],
      default: "pending",
    },
    app_id: { type: String, default: null },
  },
  { collection: "roulette_bets", timestamps: true }
);

rouletteBetSchema.index({ round_id: 1, user_id: 1 });

module.exports = mongoose.model("RouletteBet", rouletteBetSchema);
