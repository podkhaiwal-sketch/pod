const gamehostSeenModal = require("../models/gamehostSeen.model.js");
const User = require("../models/user.model.js");
const groupMSgModal = require("../models/groupMSg.model.js");
const comxMarketModel = require("../models/comxMarket.model.js");
const appControllerModal = require("../models/appController.model.js");
const resultTableModal = require("../models/resultTable.model.js");
const walletReportModal = require("../models/walletReport.model.js");
const usercoinModal = require("../models/usercoin.model.js");
const pointTableModal = require("../models/point_table.model.js");
const payment_settingModal = require("../models/payment_setting.model.js");
const user_withdrawModal = require("../models/user_withdraw.model.js");
const deduct_withrawModal = require("../models/deduct_withraw.model.js");
const chatMasterModal = require("../models/chatMaster.model.js");
const chatModal = require("../models/chat.model.js");
const moment = require("../js/moment.min.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const Joi = require("joi");
const schema = Joi.object({
  user_id: Joi.string().required(),
  department: Joi.string().required(),
});
const schemacountnotification = Joi.object({
  user_id: Joi.string().required(),
});
const schemaupdatenotification = Joi.object({
  user_id: Joi.string().required(),
  department: Joi.string().required(),
});
exports.chat_list = async (req, res) => {
  try {
    const result = schema.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const gamehostSeendata11 = await chatModal.find({
        userid: req.body.user_id,
        department: req.body.department,
      });
      const rows = {
        success: "1",
        message: "Notification List",
        data: [],
      };
      gamehostSeendata11.forEach((marketData, i) => {
        const market = {
          message: marketData.toJSON().message,
          chatType: marketData.toJSON().chatType,
          type: marketData.toJSON().type,
          imagename: marketData.toJSON().image,
          id: marketData.toJSON().id,
          datetime: marketData.toJSON().created_at,
          url: `https://chat.babaclubs.in/uploads/` + marketData.toJSON().image,
        };
        // res.status(200).send({ message:market });
        rows.data.push(market);
      });
      res.status(200).send({ message: rows });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.unseen_chat_count = async (req, res) => {
  try {
    const result = schemacountnotification.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const withdraw = await chatModal.countDocuments({
        userid: req.body.user_id,
        department: "withdraw",
        type: "admin",
        seen: "unseen",
      });
      const desposit = await chatModal.countDocuments({
        userid: req.body.user_id,
        department: "deposit",
        type: "admin",
        seen: "unseen",
      });
      const rows = {
        success: "1",
        message: "Notification Count",
        desposit: desposit,
        withdraw: withdraw,
      };
      res.status(200).send({ message: rows });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.unseen_chat_update = async (req, res) => {
  try {
    const result = schemaupdatenotification.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const updateSeenField = await chatModal.updateMany(
        {
          userid: req.body.user_id,
          department: req.body.department,
          type: "admin",
          seen: "unseen",
        },
        {
          $set: { seen: "seen" },
        }
      );
      const gamehostSeendata11 = await chatModal.countDocuments({
        userid: req.body.user_id,
        department: req.body.department,
        type: "admin",
        seen: "unseen",
      });
      const rows = {
        success: "1",
        message: "Successfully",
        data: gamehostSeendata11,
      };
      res.status(200).send({ message: rows });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
