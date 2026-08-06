const { getConfig, rouletteGame } = require("../services/rouletteGame.service.js");
const RouletteRound = require("../models/rouletteRound.model.js");
const RouletteBet = require("../models/rouletteBet.model.js");
const User = require("../models/user.model.js");

exports.getConfig = async (req, res) => {
  try {
    const config = getConfig();
    const state = rouletteGame.publicState();
    res.json({
      success: "1",
      message: "ok",
      data: { config, state },
    });
  } catch (error) {
    res.json({
      success: "0",
      message: error.message || "Unable to load roulette config.",
    });
  }
};

exports.getRecent = async (req, res) => {
  try {
    const rows = await RouletteRound.find({
      status: { $in: ["result", "closed"] },
      winning_number: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("round_id winning_number createdAt")
      .lean();

    res.json({
      success: "1",
      message: "ok",
      data: rows,
    });
  } catch (error) {
    res.json({
      success: "0",
      message: error.message || "Unable to load recent results.",
    });
  }
};

exports.getMyBets = async (req, res) => {
  try {
    const userId = String(req.body?.user_id || "");
    if (!userId) {
      return res.json({ success: "0", message: "user_id required" });
    }

    const rows = await RouletteBet.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const user = await User.findOne({ user_id: userId }).select(
      "credit win_amount"
    );
    const credit =
      Number(user?.credit || 0) + Number(user?.win_amount || 0);

    res.json({
      success: "1",
      message: "ok",
      credit,
      data: rows,
    });
  } catch (error) {
    res.json({
      success: "0",
      message: error.message || "Unable to load bets.",
    });
  }
};
