const mongoose = require("mongoose");

const rouletteRoundSchema = new mongoose.Schema(
  {
    round_id: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["betting", "spinning", "result", "closed"],
      default: "betting",
    },
    winning_number: { type: Number, default: null },
    started_at: { type: Date, default: Date.now },
    betting_ends_at: { type: Date },
    spin_ends_at: { type: Date },
    ends_at: { type: Date },
    interval_ms: { type: Number },
    win_percentage: { type: Number },
  },
  { collection: "roulette_rounds", timestamps: true }
);

module.exports = mongoose.model("RouletteRound", rouletteRoundSchema);
