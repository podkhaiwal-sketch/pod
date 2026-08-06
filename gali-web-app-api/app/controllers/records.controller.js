const Joi = require("joi");
const User = require("../models/user.model.js");
const gameLoad = require("../models/gameLoad.model.js");
const PointTable = require("../models/point_table.model.js");

const schema = Joi.object({
  app_id: Joi.string().required(),
  user_id: Joi.string().required(),
  tbl_code: Joi.string().allow("").default("all"),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(20),
});

async function ensureUser(app_id, user_id) {
  return User.findOne({
    user_id,
    app_id,
    user_status: 1,
  }).select("user_id app_id user_status");
}

function normalizeGameRow(row) {
  return {
    id: String(row._id),
    market_name: row.marketname || row.table_id || "--",
    table_id: row.table_id || "--",
    bettype: row.bettype || row.bttype || "--",
    pred_num: row.pred_num || "--",
    tr_value: Number(row.tr_value || 0),
    win_value: Number(row.win_value || 0),
    date: row.date || "--",
    datetime: row.date_time || row.bet_place_date_time || "--",
    is_result_declared: Number(row.is_result_declared || 0),
    is_win: Number(row.is_win || 0),
    tr_status: row.tr_status || "",
  };
}

function normalizeStatementRow(row) {
  return {
    id: String(row._id),
    date: row.date_time || row.date || "--",
    market_name: row.table_id || "--",
    transaction_name: row.tr_nature || row.value_update_by || "Other",
    amount: Number(row.tr_value || 0),
    win_value: Number(row.win_value || 0),
    value_type: row.tr_value_type || "--",
    remark: row.tr_remark || row.value_update_by || "--",
    status: row.tr_status || "--",
  };
}

async function listGameRows(req, res, extraFilter = {}) {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: "0", message: error.details[0].message });
  }

  const { app_id, user_id, tbl_code, page, pageSize } = value;
  const user = await ensureUser(app_id, user_id);
  if (!user) {
    return res.json({ success: "0", message: "User not found", data: [] });
  }

  const query = {
    app_id,
    user_id,
    ...extraFilter,
  };
  if (tbl_code && tbl_code !== "all") {
    query.table_id = tbl_code;
  }

  const skip = (page - 1) * pageSize;
  const rows = await gameLoad.find(query).sort({ _id: -1 }).skip(skip).limit(pageSize);
  const totalRecords = await gameLoad.countDocuments(query);

  return res.json({
    success: "1",
    message: "Records fetched successfully",
    data: rows.map(normalizeGameRow),
    pagination: page + 1,
    totalRecords,
  });
}

exports.getMyBidding = async (req, res) => {
  try {
    return await listGameRows(req, res, {
      is_result_declared: { $ne: 1 },
      is_deleted: { $ne: 1 },
    });
  } catch (error) {
    return res.status(500).json({ success: "0", message: error.message });
  }
};

exports.getOldRecords = async (req, res) => {
  try {
    return await listGameRows(req, res, {});
  } catch (error) {
    return res.status(500).json({ success: "0", message: error.message });
  }
};

exports.getMyWins = async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: "0", message: error.details[0].message });
    }

    const { app_id, user_id, tbl_code, page, pageSize } = value;
    const user = await ensureUser(app_id, user_id);
    if (!user) {
      return res.json({ success: "0", message: "User not found", data: [] });
    }

    const query = {
      app_id,
      user_id,
      tr_nature: "TRWIN005",
    };
    if (tbl_code && tbl_code !== "all") {
      query.table_id = tbl_code;
    }

    const skip = (page - 1) * pageSize;
    const rows = await PointTable.find(query).sort({ _id: -1 }).skip(skip).limit(pageSize);
    const totalRecords = await PointTable.countDocuments(query);

    return res.json({
      success: "1",
      message: "Wins fetched successfully",
      data: rows.map(normalizeGameRow),
      pagination: page + 1,
      totalRecords,
    });
  } catch (error) {
    return res.status(500).json({ success: "0", message: error.message });
  }
};

exports.getStatement = async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: "0", message: error.details[0].message });
    }

    const { app_id, user_id, page, pageSize } = value;
    const user = await ensureUser(app_id, user_id);
    if (!user) {
      return res.json({ success: "0", message: "User not found", data: [] });
    }

    const skip = (page - 1) * pageSize;
    const rows = await PointTable.find({ app_id, user_id }).sort({ _id: -1 }).skip(skip).limit(pageSize);
    const totalRecords = await PointTable.countDocuments({ app_id, user_id });

    return res.json({
      success: "1",
      message: "Statement fetched successfully",
      data: rows.map(normalizeStatementRow),
      pagination: page + 1,
      totalRecords,
    });
  } catch (error) {
    return res.status(500).json({ success: "0", message: error.message });
  }
};
