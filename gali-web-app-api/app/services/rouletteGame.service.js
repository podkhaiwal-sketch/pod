const moment = require("moment");
const User = require("../models/user.model.js");
const WalletReport = require("../models/walletReport.model.js");
const RouletteRound = require("../models/rouletteRound.model.js");
const RouletteBet = require("../models/rouletteBet.model.js");

/** Clockwise from top pointer — matches UI wheel. */
const WHEEL_ORDER = [0, 9, 1, 8, 2, 7, 3, 6, 4, 5];
const POCKETS = 10;
const ROOM = "roulette";

function envInt(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function getConfig() {
  const intervalMs = envInt("Roulette_Interval", 30000);
  const minBet = envInt("Roulette_Min_Bet", 10);
  const maxBet = envInt("Roulette_Max_Bet", 10000);
  const winPercentage = envInt("Roulette_Win_Percentage", 100);
  const spinMs = Math.min(8000, Math.max(4000, Math.floor(intervalMs * 0.25)));
  const resultMs = Math.min(4000, Math.max(2000, Math.floor(intervalMs * 0.1)));
  const bettingMs = Math.max(8000, intervalMs - spinMs - resultMs);
  // Win only on the winning number: 100% => 2x that number's bet (stake + equal profit).
  // Other numbers' bets are lost and never included in payout.
  const payoutMultiplier = 2 * (winPercentage / 100);
  return {
    intervalMs,
    minBet,
    maxBet,
    winPercentage,
    spinMs,
    resultMs,
    bettingMs,
    payoutMultiplier,
    wheelOrder: WHEEL_ORDER,
  };
}

function makeRoundId() {
  return `R${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/**
 * House-edge result:
 * - Always prefer the number with the lowest total bet (admin earns more).
 * - If unique players in the round are < 5, land on a number with ZERO bets
 *   whenever possible (admin keeps the full pot).
 */
function pickWinningNumber(bets = []) {
  const totals = Array.from({ length: POCKETS }, () => 0);
  const users = new Set();

  for (const bet of bets) {
    const n = Number(bet.number);
    const amount = Number(bet.amount) || 0;
    if (Number.isInteger(n) && n >= 0 && n < POCKETS) {
      totals[n] += amount;
    }
    if (bet.user_id) users.add(String(bet.user_id));
  }

  const emptyNumbers = totals
    .map((total, number) => (total === 0 ? number : null))
    .filter((n) => n !== null);

  // Fewer than 5 players → declare on a number nobody played
  if (users.size < 5 && emptyNumbers.length > 0) {
    return emptyNumbers[Math.floor(Math.random() * emptyNumbers.length)];
  }

  // Otherwise (or if every pocket has a bet) → minimum bet amount pocket
  const minAmount = Math.min(...totals);
  const minNumbers = totals
    .map((total, number) => (total === minAmount ? number : null))
    .filter((n) => n !== null);

  return minNumbers[Math.floor(Math.random() * minNumbers.length)];
}

function userBalance(user) {
  return Number(user.credit || 0) + Number(user.win_amount || 0);
}

async function debitUser(userId, amount, remark) {
  const user = await User.findOne({ user_id: String(userId) }).select(
    "user_id credit win_amount"
  );
  if (!user) throw new Error("User not found.");

  const credit = Number(user.credit || 0);
  const winAmount = Number(user.win_amount || 0);
  const total = credit + winAmount;
  if (total < amount) throw new Error("Insufficient balance.");

  let nextCredit = credit;
  let nextWin = winAmount;
  if (credit >= amount) {
    nextCredit = credit - amount;
  } else {
    nextCredit = 0;
    nextWin = winAmount - (amount - credit);
  }

  await User.updateOne(
    { user_id: String(userId) },
    { $set: { credit: nextCredit, win_amount: nextWin } }
  );

  await WalletReport.create({
    user_id: String(userId),
    tr_nature: "debit",
    tr_value: amount,
    tr_value_updated: nextCredit + nextWin,
    type: "roulette",
    game_type: "roulette",
    tr_status: "success",
    tr_remark: remark,
    date: moment().format("YYYY-MM-DD"),
    date_time: moment().format("YYYY-MM-DD HH:mm:ss"),
    transaction_id: `RLD${Date.now()}`,
  });

  return nextCredit + nextWin;
}

async function creditUser(userId, amount, remark) {
  const user = await User.findOne({ user_id: String(userId) }).select(
    "user_id credit win_amount"
  );
  if (!user) return 0;

  const nextWin = Number(user.win_amount || 0) + amount;
  const nextCredit = Number(user.credit || 0);
  await User.updateOne(
    { user_id: String(userId) },
    { $set: { win_amount: nextWin } }
  );

  await WalletReport.create({
    user_id: String(userId),
    tr_nature: "credit",
    tr_value: amount,
    tr_value_updated: nextCredit + nextWin,
    type: "roulette",
    game_type: "roulette",
    tr_status: "success",
    tr_remark: remark,
    date: moment().format("YYYY-MM-DD"),
    date_time: moment().format("YYYY-MM-DD HH:mm:ss"),
    transaction_id: `RLW${Date.now()}`,
    is_win: 1,
    win_value: amount,
  });

  return nextCredit + nextWin;
}

async function getCredit(userId) {
  const user = await User.findOne({ user_id: String(userId) }).select(
    "credit win_amount"
  );
  if (!user) return 0;
  return userBalance(user);
}

class RouletteGameService {
  constructor() {
    this.io = null;
    this.round = null;
    this.recent = [];
    this.timers = [];
    this.tickTimer = null;
    this.started = false;
    this.socketUsers = new Map(); // socketId -> userId
  }

  async start(io) {
    if (this.started) return;
    this.io = io;
    this.started = true;
    this.wireSockets();
    this.recent = await this.loadRecent();
    await this.beginRound();
    console.log("[roulette] game loop started", getConfig());
  }

  wireSockets() {
    this.io.on("connection", (socket) => {
      socket.on("roulette:join", async (payload = {}) => {
        try {
          const userId = String(payload.userId || "");
          socket.join(ROOM);
          if (userId) this.socketUsers.set(socket.id, userId);
          const credit = userId ? await getCredit(userId) : 0;
          const myBets = userId ? await this.getUserRoundBets(userId) : [];
          socket.emit("roulette:state", {
            ...this.publicState(),
            credit,
            myBets,
            config: this.publicConfig(),
          });
        } catch (err) {
          socket.emit("roulette:error", {
            message: err.message || "Unable to join roulette.",
          });
        }
      });

      socket.on("roulette:placeBet", async (payload = {}) => {
        try {
          const result = await this.placeBets(payload);
          socket.emit("roulette:betAccepted", result);
          if (result.userId) {
            this.emitToUser(result.userId, "roulette:balance", {
              credit: result.credit,
            });
          }
        } catch (err) {
          socket.emit("roulette:error", {
            message: err.message || "Unable to place bet.",
          });
        }
      });

      socket.on("disconnect", () => {
        this.socketUsers.delete(socket.id);
      });
    });
  }

  publicConfig() {
    const c = getConfig();
    return {
      intervalMs: c.intervalMs,
      minBet: c.minBet,
      maxBet: c.maxBet,
      winPercentage: c.winPercentage,
      payoutMultiplier: c.payoutMultiplier,
      spinMs: c.spinMs,
      bettingMs: c.bettingMs,
      wheelOrder: c.wheelOrder,
    };
  }

  publicState() {
    const now = Date.now();
    const endsAt = this.round?.endsAt || now;
    const bettingEndsAt = this.round?.bettingEndsAt || now;
    const phase = this.round?.phase || "betting";
    let secondsLeft = 0;
    if (phase === "betting") {
      secondsLeft = Math.max(0, Math.ceil((bettingEndsAt - now) / 1000));
    } else if (phase === "spinning") {
      secondsLeft = Math.max(0, Math.ceil((this.round.spinEndsAt - now) / 1000));
    } else {
      secondsLeft = Math.max(0, Math.ceil((endsAt - now) / 1000));
    }

    return {
      roundId: this.round?.roundId || null,
      phase,
      winningNumber:
        phase === "spinning" || phase === "result"
          ? this.round?.winningNumber
          : null,
      secondsLeft,
      endsAt,
      bettingEndsAt,
      spinEndsAt: this.round?.spinEndsAt || null,
      serverNow: now,
      recent: this.recent,
    };
  }

  clearTimers() {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  async loadRecent() {
    const rows = await RouletteRound.find({
      status: { $in: ["result", "closed"] },
      winning_number: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .select("winning_number")
      .lean();
    return rows.map((r) => Number(r.winning_number));
  }

  async beginRound() {
    this.clearTimers();
    const config = getConfig();
    const now = Date.now();
    const roundId = makeRoundId();
    const bettingEndsAt = now + config.bettingMs;
    const spinEndsAt = bettingEndsAt + config.spinMs;
    const endsAt = spinEndsAt + config.resultMs;

    this.round = {
      roundId,
      phase: "betting",
      winningNumber: null,
      startedAt: now,
      bettingEndsAt,
      spinEndsAt,
      endsAt,
    };

    await RouletteRound.create({
      round_id: roundId,
      status: "betting",
      started_at: new Date(now),
      betting_ends_at: new Date(bettingEndsAt),
      spin_ends_at: new Date(spinEndsAt),
      ends_at: new Date(endsAt),
      interval_ms: config.intervalMs,
      win_percentage: config.winPercentage,
    });

    this.broadcast("roulette:state", {
      ...this.publicState(),
      config: this.publicConfig(),
    });

    this.tickTimer = setInterval(() => {
      this.broadcast("roulette:tick", {
        roundId: this.round.roundId,
        phase: this.round.phase,
        secondsLeft: this.publicState().secondsLeft,
        serverNow: Date.now(),
      });
    }, 1000);

    this.timers.push(
      setTimeout(() => {
        this.startSpin().catch((err) =>
          console.error("[roulette] startSpin error", err)
        );
      }, config.bettingMs)
    );
  }

  async startSpin() {
    if (!this.round || this.round.phase !== "betting") return;

    const pendingBets = await RouletteBet.find({
      round_id: this.round.roundId,
      status: "pending",
    })
      .select("user_id number amount")
      .lean();

    const winningNumber = pickWinningNumber(pendingBets);
    this.round.phase = "spinning";
    this.round.winningNumber = winningNumber;

    await RouletteRound.updateOne(
      { round_id: this.round.roundId },
      { $set: { status: "spinning", winning_number: winningNumber } }
    );

    this.broadcast("roulette:spin", {
      roundId: this.round.roundId,
      winningNumber,
      spinMs: getConfig().spinMs,
      secondsLeft: this.publicState().secondsLeft,
    });

    const spinWait = Math.max(0, this.round.spinEndsAt - Date.now());
    this.timers.push(
      setTimeout(() => {
        this.finishRound().catch((err) =>
          console.error("[roulette] finishRound error", err)
        );
      }, spinWait)
    );
  }

  async finishRound() {
    if (!this.round) return;
    const roundId = this.round.roundId;
    const winningNumber = this.round.winningNumber;
    const config = getConfig();

    this.round.phase = "result";

    const bets = await RouletteBet.find({
      round_id: roundId,
      status: "pending",
    });

    const userWins = new Map();

    for (const bet of bets) {
      // Pay only the stake on the winning number (never total of all numbers).
      if (Number(bet.number) === Number(winningNumber)) {
        const payout = Math.floor(
          Number(bet.amount) * config.payoutMultiplier
        );
        bet.status = "won";
        bet.payout = payout;
        await bet.save();
        userWins.set(
          bet.user_id,
          (userWins.get(bet.user_id) || 0) + payout
        );
      } else {
        bet.status = "lost";
        bet.payout = 0;
        await bet.save();
      }
    }

    for (const [userId, payout] of userWins.entries()) {
      const credit = await creditUser(
        userId,
        payout,
        `Roulette win round ${roundId} number ${winningNumber}`
      );
      this.emitToUser(userId, "roulette:result", {
        roundId,
        winningNumber,
        winAmount: payout,
        credit,
        won: true,
      });
      this.emitToUser(userId, "roulette:balance", { credit });
    }

    // Notify losers / players with no win for this round
    const participants = [...new Set(bets.map((b) => b.user_id))];
    for (const userId of participants) {
      if (userWins.has(userId)) continue;
      const credit = await getCredit(userId);
      this.emitToUser(userId, "roulette:result", {
        roundId,
        winningNumber,
        winAmount: 0,
        credit,
        won: false,
      });
    }

    this.recent = [winningNumber, ...this.recent].slice(0, 12);

    await RouletteRound.updateOne(
      { round_id: roundId },
      { $set: { status: "closed" } }
    );

    this.broadcast("roulette:roundResult", {
      roundId,
      winningNumber,
      recent: this.recent,
      secondsLeft: this.publicState().secondsLeft,
    });

    const wait = Math.max(0, this.round.endsAt - Date.now());
    this.timers.push(
      setTimeout(() => {
        this.beginRound().catch((err) =>
          console.error("[roulette] beginRound error", err)
        );
      }, wait)
    );
  }

  async getUserRoundBets(userId) {
    if (!this.round?.roundId) return [];
    const rows = await RouletteBet.find({
      round_id: this.round.roundId,
      user_id: String(userId),
    }).lean();
    return rows.map((r) => ({
      number: r.number,
      amount: r.amount,
      status: r.status,
    }));
  }

  async placeBets(payload) {
    const userId = String(payload.userId || "");
    const appId = payload.app_id || payload.appId || null;
    const bets = Array.isArray(payload.bets) ? payload.bets : [];

    if (!userId) throw new Error("User id required.");
    if (!this.round || this.round.phase !== "betting") {
      throw new Error("Betting is closed for this round.");
    }
    if (!bets.length) throw new Error("No bets provided.");

    const config = getConfig();
    const normalized = [];
    let total = 0;

    for (const item of bets) {
      const number = Number(item.number);
      const amount = Number(item.amount);
      if (!Number.isInteger(number) || number < 0 || number > 9) {
        throw new Error("Invalid number. Use 0-9.");
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid bet amount.");
      }
      if (amount < config.minBet) {
        throw new Error(`Minimum bet is ${config.minBet}.`);
      }
      if (amount > config.maxBet) {
        throw new Error(`Maximum bet is ${config.maxBet}.`);
      }
      total += amount;
      normalized.push({ number, amount });
    }

    if (total > config.maxBet) {
      throw new Error(`Total bet cannot exceed ${config.maxBet}.`);
    }

    const creditAfter = await debitUser(
      userId,
      total,
      `Roulette bet round ${this.round.roundId}`
    );

    const docs = normalized.map((b) => ({
      round_id: this.round.roundId,
      user_id: userId,
      number: b.number,
      amount: b.amount,
      status: "pending",
      app_id: appId,
    }));
    await RouletteBet.insertMany(docs);

    const myBets = await this.getUserRoundBets(userId);
    return {
      userId,
      roundId: this.round.roundId,
      bets: myBets,
      totalBet: total,
      credit: creditAfter,
      maxWin: Math.floor(
        Math.max(...normalized.map((b) => b.amount), 0) * config.payoutMultiplier
      ),
    };
  }

  broadcast(event, data) {
    if (!this.io) return;
    this.io.to(ROOM).emit(event, data);
  }

  emitToUser(userId, event, data) {
    if (!this.io) return;
    for (const [socketId, uid] of this.socketUsers.entries()) {
      if (String(uid) === String(userId)) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }
}

const rouletteGame = new RouletteGameService();

module.exports = {
  rouletteGame,
  getConfig,
  WHEEL_ORDER,
};
