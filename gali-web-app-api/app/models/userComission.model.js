const mongoose = require("mongoose");

const userComissionSchema = new mongoose.Schema(
  {
    user_id: { type: String, default: null },
    amount: { type: String, default: null },
    market_id: { type: String, default: null },
    date: { type: String, default: null },
    batId: { type: String, default: null },
    status: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "user_comissions", 
  }
);

const user_comissions = mongoose.model("user_comissions", userComissionSchema);

module.exports = user_comissions;
