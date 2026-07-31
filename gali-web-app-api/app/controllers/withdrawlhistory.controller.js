const User = require("../models/user.model.js");
const PointTable = require("../models/point_table.model.js");
const TrType = require('../models/trtype.model.js');
const TblTypes = require('../models/tbltypes.model.js');
const ComxAppmarkets = require('../models/comxappmarkets.model.js');
const deduct_withrawModal = require("../models/deduct_withraw.model.js");
const mongoose = require('mongoose');
const randomstring = require("randomstring");
const Joi = require('joi');
const axios = require('axios');

exports.withdrawalReport = async (req, res) => {
  try {
    const dev_id = req.body.dev_id;
    const app_id = req.body.app_id;
    const user_id = req.body.user_id;
    if (!app_id || !dev_id || !user_id) {
      return res.status(400).json({ success: "0", message: "Error Please Fill All Details" });
    }
    const user = await User.findOne({ user_id: user_id, app_id: app_id, user_status: 1 });
    if (user) {
      const withdrawalReports = await PointTable.find({
        app_id: app_id,
        user_id: user_id,
      })
      .sort({ _id: -1 })
      .limit(10);
      if (withdrawalReports.length > 0) {
        const data = await Promise.all(withdrawalReports.map(async (row) => {
          let type = "";
          if (row.tr_remark === "redeemed") {
            type = "Bonus";
          }
          if (row.is_transfer === null) {
            row.is_transfer = "";
          }
          if (row.is_transfer === 1) {
            row.value_update_by = row.value_update_by + "\n" + row.tr_remark;
          }
          if (row.value_update_by === "Game") {
            row.value_update_by = row.tr_remark + "\n" + row.table_id;
          }
          if (row.tr_value_type === "Debit" && row.tr_nature === "TRGAME001") {
            const date1 = row.betExpTime;
            const date2 = new Date().toISOString();
            const timestamp1 = new Date(date1).getTime();
            const timestamp2 = new Date(date2).getTime();
            row.delStatus = timestamp1 > timestamp2 ? 1 : 0;
          }
          if (row.value_update_by === "Deposit") {
            row.value_update_by = row.value_update_by + "\n" + row.tr_remark;
          }
          row.date = new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          const tblcodeData = await TblTypes.findOne({ app_id: app_id, tbl_code: row.game_type });
          const trnstypeName = await TrType.findOne({ app_id: app_id, tr_type_code: row.tr_nature });
          const slotData = await ComxAppmarkets.findOne({ app_id: app_id, market_id: row.table_id });
          return {
            ...row.toObject(),
            game_type: tblcodeData ? tblcodeData.tbl_name : 'Table Not Found',
            transaction_name: trnstypeName ? trnstypeName.tr_type_name : 'Other',
            market_name: slotData ? slotData.market_name : 'NFS',
          };
        }));
        return res.json({ success: "1", message: "PointData details success", winAmount: user.credit, data });
      } else {
        return res.json({ success: "0", message: "No data Available Or May Be Something went wrong", winAmount: user.credit });
      }
    } else {
      return res.json({ success: '3', message: 'User Not Exists Or Blocked Please Check Again' });
    }
  }catch (error) {
   res.status(500).json({ error: error.message });
    return;
  }
};
