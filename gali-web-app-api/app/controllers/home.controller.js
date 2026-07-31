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
const redAccountList = require("../models/redAccountList.model.js");
const userTempModal = require("../models/userTemp.model.js");
const add_bank_account = require("../models/add_bank_account.model.js");
const imbOrderModal = require("../models/imbOrder.model.js");
const ResultWebsiteLinksModel = require("../models/ResultWebsiteLinks.model.js");
const moment = require("../js/moment.min.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const { MongoClient } = require("mongodb");
const axios = require("axios");
const querystring = require("querystring");

const Joi = require("joi");
const schema = Joi.object({
  user_id: Joi.string().required(),
});
const schemaHome = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
});

const schemaTransfer = Joi.object({
  user_id: Joi.string().required(),
  devName: Joi.string().required(),
  rec_mob: Joi.string().required(),
  amount: Joi.number().required(),
  otp: Joi.required(),
});
const schemaSingleMarketResult = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
  market_id: Joi.string().required(),
  type: Joi.string().required(),
});
const schemaAllGameResultsByMonth = Joi.object({
  app_id: Joi.string().allow("").optional(),
  /** Supported: YYYY-MM, MM-YYYY, MMMM YYYY (e.g. March 2026) */
  month: Joi.string().required(),
});
const schemadeduct_user_balance = Joi.object({
  orderId: Joi.string().required(),
  orderAmount: Joi.number().required(),
  referenceId: Joi.string().required(),
  txStatus: Joi.string().required(),
  paymentMode: Joi.string().required(),
  txMsg: Joi.string().required(),
  upiID: Joi.string().required(),
  Token: Joi.string().required(),
  userID: Joi.string().required(),
  auth: Joi.string().required(),
  devName: Joi.string().required(),
  devType: Joi.string().required(),
  cod: Joi.string().required(),
  devId: Joi.string().required(),
});
const schemaapp_manager = Joi.object({
  user_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaadd_account = Joi.object({
  user_id: Joi.string().required(),
  ac_number: Joi.number().required(),
  ifsc: Joi.string().required(),
  account_holder: Joi.string().required(),
  bank_name: Joi.string().required(),
});
const schemaaddMsgGroup = Joi.object({
  user_id: Joi.string().required(),
  message: Joi.string().required(),
});

const schemadeduct_withdrawweb = Joi.object({
  user_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  account_number: Joi.required(),
  ifsc_code: Joi.string().required(),
  amount: Joi.number().required(),
  app_id: Joi.string().required(),
});
const schemadeduct_withdrawUpiweb = Joi.object({
  user_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  upiid: Joi.required(),
  amount: Joi.number().required(),
  app_id: Joi.string().required(),
});
const schemaadd_bank_account = Joi.object({
  user_id: Joi.string().required(),
  bank_name: Joi.string().required(),
  otp: Joi.required(),
  account_holder: Joi.string().required(),
  account_number: Joi.required(),
  ifsc_code: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaadd_all_bank_account = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaadd_success_bank_account = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaCreateImbOrder = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
  amount: Joi.number().greater(0).required(),
  // user_token: Joi.string().required(),
  /** Optional: userTemps document _id; if omitted, resolved by user mobile */
  user_temp_id: Joi.string().allow("").optional(),
  customer_mobile: Joi.string().allow("").optional(),
  order_id: Joi.string().allow("").optional(),
  redirect_url: Joi.string().allow("").optional(),
  remark1: Joi.string().allow("").optional(),
  remark2: Joi.string().allow("").optional(),
  webhook_url: Joi.string().allow("").optional(),
  devName: Joi.string().allow("").optional(),
  devType: Joi.string().allow("").optional(),
  devId: Joi.string().allow("").optional(),
});
const schemaImbOrderStatus = Joi.object({
  order_id: Joi.string().required(),
  user_token: Joi.string().allow("").optional(),
  devName: Joi.string().allow("").optional(),
  devType: Joi.string().allow("").optional(),
  devId: Joi.string().allow("").optional(),
});

const schemaImbListOrders = Joi.object({
  app_id: Joi.string().allow("").optional(),
  /** omit or "all" = every status */
  status: Joi.string().allow("").optional(),
  page: Joi.number().integer().min(1).optional(),
  page_size: Joi.number().integer().min(1).max(500).optional(),
});

const schemaImbSyncPending = Joi.object({
  /** max 5000; use sync_all to take a high default */
  limit: Joi.number().integer().min(1).max(5000).optional(),
  sync_all: Joi.boolean().optional(),
  app_id: Joi.string().allow("").optional(),
  /** Also re-check IMB for locally FAILED orders (paid may arrive late). */
  include_failed: Joi.boolean().optional(),
  devName: Joi.string().allow("").optional(),
  devType: Joi.string().allow("").optional(),
  devId: Joi.string().allow("").optional(),
});

const coerceImbSyncPendingBody = (body) => {
  const b = { ...(body || {}) };
  if (b.sync_all === "true" || b.sync_all === "1") b.sync_all = true;
  if (b.sync_all === "false" || b.sync_all === "0") b.sync_all = false;
  if (b.include_failed === "true" || b.include_failed === "1") b.include_failed = true;
  if (b.include_failed === "false" || b.include_failed === "0") b.include_failed = false;
  return b;
};

const IMB_BASE_URL = process.env.IMB_BASE_URL || "https://secure-stage.imb.org.in";
const IMB_CREATE_ORDER_PATH = "/api/create-order";
const IMB_CHECK_ORDER_PATH = "/api/check-order-status";
const IMB_USER_TOKEN = process.env.IMB_USER_TOKEN || "";

const parseMonthFilter = (rawMonth) => {
  const s = String(rawMonth || "").trim();
  if (!s) return null;

  const formats = ["YYYY-MM", "MM-YYYY", "MMMM YYYY", "MMM YYYY"];
  for (const fmt of formats) {
    const m = moment(s, fmt, true);
    if (m && m.isValid && m.isValid()) {
      return {
        year: m.format("YYYY"),
        monthNumber: m.format("MM"),
        monthLabel: m.format("MMMM YYYY"),
      };
    }
  }
  return null;
};

/** Accept string or nested { order_id } from bad clients; reject "[object Object]" */
const normalizeImbOrderId = (raw) => {
  if (raw == null || raw === "") return "";
  if (typeof raw === "object" && raw !== null) {
    const nested =
      raw.order_id ?? raw.orderId ?? raw.id ?? raw.order?.order_id;
    if (nested != null && nested !== "") return String(nested).trim();
    return "";
  }
  const s = String(raw).trim();
  if (!s || s === "[object Object]") return "";
  return s;
};

const isImbUnsupportedContentTypeResponse = (data) => {
  if (!data || typeof data !== "object") return false;
  const msg = String(data.message || data.msg || "").toLowerCase();
  return (
    msg.includes("unsupported content-type") ||
    (msg.includes("content-type") && msg.includes("unsupported"))
  );
};

/** IMB check-order: prefer JSON (stage often rejects form with "Unsupported Content-Type"). */
const fetchImbCheckOrderStatus = async ({ user_token, order_id }) => {
  const token = user_token || IMB_USER_TOKEN;
  const url = `${IMB_BASE_URL}${IMB_CHECK_ORDER_PATH}`;
  const formBody = querystring.stringify({ user_token: token, order_id });

  const postForm = () =>
    axios.post(url, formBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      timeout: 20000,
    });

  try {
    const res = await axios.post(
      url,
      { user_token: token, order_id },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000,
      }
    );
    if (isImbUnsupportedContentTypeResponse(res.data)) {
      return postForm();
    }
    return res;
  } catch (err) {
    const status = err.response?.status;
    if (status === 415 || status === 400 || status === 406) {
      return postForm();
    }
    throw err;
  }
};
exports.resultLink = async (req, res) => {
  try {
    const data = await ResultWebsiteLinksModel.find({
      status: "1",
    });
    const rows = {
      success: 1,
      data: data,
      message: "Successfully",
    };
    res.status(200).send(rows);
    return;
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.get_group_msg = async (req, res) => {
  try {
    const result = schema.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      //  res.status(200).send({ message:date });
      //   return;
      let currentDatelastseen = moment();
      // currentDatelastseen.add(5, 'hours').add(30, 'minutes');
      let fromdates = currentDatelastseen.format("YYYY-MM-DD");
      const gamehostSeendata = await gamehostSeenModal.findOne({
        user_id: req.body.user_id,
        view_date: fromdates,
      });
      //  const count01 = await gamehostSeenModal.find().sort({ id: 'desc' }).limit(1).exec();
      //     if (count01.length>0) {
      //     var ids01 = count01[0].id + 1;
      //   } else {
      //     var ids01 = 1;
      //   }
      if (!gamehostSeendata) {
        const newBonus = new gamehostSeenModal({
          // id:ids01,
          view_date: fromdates,
          user_id: req.body.user_id,
        });
        newBonus.save();
      }
      const rows = {
        status: "1",
        data: [],
      };
      const gamehostSeendata11 = await groupMSgModal.find();
      gamehostSeendata11.forEach((marketData, i) => {
        const market = {
          message: marketData.toJSON().message,
          id: marketData.toJSON().id,
          name: marketData.toJSON().name,
          datetime: marketData.toJSON().created_at,
        };
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
exports.home_list = async (req, res) => {
  try {

    const result = schemaHome.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const user = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
      });
      if (user) {
        const comxMarket = await comxMarketModel
          .find({
            app_id: req.body.app_id,
            status: 1,
          })
          .sort({ market_position: +1 });

        const appController = await appControllerModal.findOne({
          app_id: req.body.app_id,
        });
        let currentDate = moment();

        // Add 5 hours and 30 minutes
        currentDate.add(5, "hours").add(30, "minutes");

        let currentDatelastseen = moment();
        // currentDatelastseen.add(5, 'hours').add(30, 'minutes');
        let formattedDateTimelastseen = currentDatelastseen.format(
          "YYYY-MM-DD hh:mm:ss A"
        );
        await User.updateOne(
          {
            user_id: req.body.user_id,
            // app_id: "com.babaji.galigame",
            app_id: "com.dubaiking",
          },

          {
            $set: {
              last_seen: currentDate,
              last_seen_date_time: formattedDateTimelastseen,
              created_at: currentDate,
              updated_at: currentDate,
            },
          }
        );

        if (comxMarket.length > 0) {
          const currentDate1 = new Date();
          // Format the date as 'DD-MM-YYYY'
          const currentdate = moment(currentDate1).format("DD-MM-YYYY");
          const sqlQuery = {
            date: currentdate,
          };
          const result = await resultTableModal
            .findOne(sqlQuery)
            .sort({ _id: -1 });

          if (result) {
            var lastUpdated_marketId = result.toJSON().market_id;
            var lastresult = result.toJSON().result;
            var date_time_result = result.toJSON().date_time_result;
            var comxMarketPerticulatMarket = await comxMarketModel.findOne({
              app_id: req.body.app_id,
              market_id: lastUpdated_marketId,
            });
            var market_name = comxMarketPerticulatMarket.toJSON().market_name;
          } else {
            var lastresult = "Result Not Available";
            var market_id = " Not Available";
            var market_name = " Not Available";
            var date_time_result = " Not Available";
          }
          const timestamp = Date.now();
          const formattedDate = moment(timestamp).format(
            "DD-MM-YYYY ddd hh:mm:ss A"
          );
          const usercredit = user.toJSON().credit + user.toJSON().win_amount;
          const currentMarketDetails = {
            whatsap: appController.toJSON().whatsapp,
            call: appController.toJSON().call_enable,
            tg_link: appController.toJSON().tg_link,
            fb_link: appController.toJSON().fb_link,
            playstore: appController.toJSON().playstore,
            whatsapnum: appController.toJSON().admin_contact_mob,
            other_game: appController.toJSON().other_game,
            market_name: market_name,
            market_id: lastUpdated_marketId,
            updated_time: date_time_result,
            market_result: lastresult,
          };
          const currentDatenew = new Date();
          // Format the date as 'DD-MM-YYYY'
          const currentdate11 = moment(currentDatenew).format("DD-MM-YYYY");
          const rows = {
            success: "1",
            message: "Home dashboard Fetch Successfully",
            nformat: formattedDate,
            user_balance: usercredit,
            is_kyc: user.toJSON().is_kyc,
            note: "👉👉🙏",
            marquee_msg: appController.toJSON().move_msg,
            current_market_details: "KGF Today Results",
            current_market_details: currentMarketDetails,
            current_date: currentdate11,
            data: [],
          };
          // if (appController.toJSON().is_paly_on_off == "1") {
          if (appController.toJSON().market_disable == "1") {
            for (var i = 0; i < comxMarket.length; i++) {
              var mid = comxMarket[i].toJSON().market_id;
              var market_id = comxMarket[i].toJSON().market_id;
              const currentDate1 = new Date();
              const currentdate = moment(currentDate1).format("DD-MM-YYYY");
              const sqlQuery = {
                market_id: market_id,
                date: currentdate,
              };
              const restdata = await resultTableModal.findOne({
                market_id: market_id,
                date: currentdate,
              });
              if (restdata != null) {
                var marketRes = restdata.toJSON().result;
                if (marketRes != "") {
                  var marketDetails = {
                    market_result: marketRes,
                  };
                } else {
                  var marketDetails = {
                    market_result: "XX",
                  };
                }
              } else {
                var marketDetails = {
                  market_result: "XX",
                };
              }
              const yesterday = moment().subtract(1, "days");
              const formattedYesterday = yesterday.format("DD-MM-YYYY");
              var market_id1 = comxMarket[i].toJSON().market_id;
              const restdata1 = await resultTableModal.findOne({
                market_id: market_id1,
                date: formattedYesterday,
              });
              if (restdata1 != null) {
                var premarketRes = restdata1.toJSON().result;
                if (premarketRes != "") {
                  marketDetails.market_result_previous_day = premarketRes;
                } else {
                  marketDetails.market_result_previous_day = "XX";
                }
              } else {
                marketDetails.market_result_previous_day = "XX";
              }
              var openTime = moment(
                comxMarket[i].toJSON().market_view_time_open,
                "HH:mm"
              ).format("h:mm A");
              var closeTime = moment(
                comxMarket[i].toJSON().market_sunday_time_close,
                "HH:mm"
              ).format("h:mm A");
              var resultTime = moment(
                comxMarket[i].toJSON().market_view_time_close,
                "HH:mm"
              ).format("h:mm A");
              marketDetails.market_name = comxMarket[i].toJSON().market_name;
              marketDetails.openTime = openTime;
              marketDetails.closeTime = resultTime;
              marketDetails.resultTime = closeTime;
              var mtime = comxMarket[i].toJSON().market_view_time_close;
              const time_in_24_hour_format = moment(mtime, "h:mm A").format(
                "HH:mm"
              );
              if (mid == "DISAWAR") {
                // const startRange = moment('02:40', 'HH:mm');
                const startRange = moment("00:30", "HH:mm");
                const endRange = moment("07:00", "HH:mm");
                const currentTime = moment(time_in_24_hour_format, "HH:mm");
                const isBetween = currentTime.isBetween(
                  startRange,
                  endRange,
                  null,
                  "[]"
                );
                if (isBetween) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else if (mid == "SHIV ") {
                const startRange1 = moment("01:00", "HH:mm");
                const endRange1 = moment("09:00", "HH:mm");
                const currentTime1 = moment(time_in_24_hour_format, "HH:mm");
                const isBetween1 = currentTime1.isBetween(
                  startRange1,
                  endRange1,
                  null,
                  "[]"
                );
                if (isBetween1) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else if (mid == "MAFIY") {
                const startRange11 = moment("02:45", "HH:mm");
                const endRange11 = moment("09:00", "HH:mm");
                const currentTime11 = moment(time_in_24_hour_format, "HH:mm");
                const isBetween11 = currentTime11.isBetween(
                  startRange11,
                  endRange11,
                  null,
                  "[]"
                );
                if (isBetween11) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else if (mid == "KGFTIME") {
                const startRange11 = moment("00:30", "HH:mm");
                const endRange11 = moment("07:00", "HH:mm");
                const currentTime11 = moment(time_in_24_hour_format, "HH:mm");
                const isBetween11 = currentTime11.isBetween(
                  startRange11,
                  endRange11,
                  null,
                  "[]"
                );
                if (isBetween11) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else {
                const timestamp21 = Date.now();
                const currentDateTime21 = new Date(timestamp21);
                const options = {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                };
                const current_time_second_24hours =
                  currentDateTime21.toLocaleTimeString("en-US", options);
                const timestamp31 = Date.now();
                const currentDateTime31 = new Date(timestamp31);
                const currentHour = currentDateTime31.getHours();
                if (
                  current_time_second_24hours < time_in_24_hour_format &&
                  currentHour > 6
                ) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              }
              marketDetails.market_id = market_id;
              marketDetails.mini_bet = "5";
              marketDetails.max_bet = "200";
              marketDetails.betpoint_change_time = "100";
              rows.data.push(marketDetails);
            }
          }
          res.status(200).send(rows);
          return;
        } else {
          res
            .status(200)
            .send({ status: "0", message: "No Market Availavle For Play" });
          return;
        }
      } else {
        res.status(200).send({ status: "0", message: "User not Exits" });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};

exports.transfer_store = async (req, res) => {
  try {
    const result = schemaTransfer.validate(req.body);
    if (result.error) {
      return res.status(200).json({ message: result.error.message });
    } else {
      //   if (["TMJADBZVFK", "APlISsZGTl", "BJWRZYDKSX", "EFZANSTXOP", "URYOWQTADS", "TIWUMVHECO"].includes(req.body.user_id)) {

      // } else {
      //   return;
      // }
      const currentDate = moment();
      // Format the date
      const currentdate = currentDate.format("DD-MM-YYYY");
      const currentdateTime = currentDate.format("DD-MM-YYYY HH:mm:ss");
      const userData = await User.findOne({
        user_id: req.body.user_id,
        mob: req.body.rec_mob,
      });
      if (userData) {
        return res
          .status(200)
          .send({ status: "0", message: "Same Account Not Transfer Amount" });
      }
      const userother = await User.findOne({
        mob: req.body.rec_mob,
      });
      var dates = "'" + currentdate + "'";
      if (userother) {
        const today = new Date(); // Current date
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1); // Subtract 1 day from current date
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Add 1 day to current date
        const walletReport = await walletReportModal.findOne({
          user_id: req.body.user_id,
          date: currentdate,
          tr_nature: "TRWITH003",
          type: "Debit",
          value_update_by: "Transfer",
        });
        // res.status(200).send({ status:'0',message:walletReport });
        if (walletReport) {
          return res.status(200).send({
            status: "0",
            message: "You can transfer Coin once in a day",
          });
        } else {
          var amount = req.body.amount;
          const appcontroller = await appControllerModal.findOne();
          var transfer_min = appcontroller.toJSON().transfer_min;
          var transfer_max = appcontroller.toJSON().transfer_max;
          if (
            amount >= parseInt(transfer_min) &&
            amount <= parseInt(transfer_max)
          ) {
            const user1 = await User.findOne({
              user_id: req.body.user_id,
              user_status: "1",
            });
            const userTemps = await userTempModal.findOne({
              mob: user1.mob,
              // otp: req.body.otp,
            });
            var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
            if (reqiestid == "Invalid otp") {
              return res.status(200).json({
                success: "3",
                message: "Invalid Otp",
              });
            }
            var rec_id = userother.toJSON().user_id;
            const userSelf = await User.findOne({
              user_id: req.body.user_id,
            });
            if (userSelf.toJSON().win_amount < amount) {
              return res
                .status(200)
                .send({ status: "0", message: "Amount is low" });
            }
            var newamount =
              parseInt(userSelf.toJSON().win_amount) - parseInt(amount);
            var newsenderCoin =
              userSelf.toJSON().win_amount + userSelf.toJSON().credit - amount;
            var smob = userSelf.toJSON().mob;
            var sfullname = userSelf.toJSON().FullName;
            var newcoins =
              parseInt(userother.toJSON().win_amount) + parseInt(amount);
            var ccoins =
              parseInt(userother.toJSON().win_amount) +
              parseInt(userother.toJSON().credit) +
              parseInt(amount);
            var devType = "";
            var tr_id =
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
            //  const count02 = await pointTableModal.find().sort({ id: 'desc' }).limit(1).exec();
            //     if (count02.length>0) {
            //       if (count02[0].id == undefined) {
            //         var ids02 = 1;
            //       }else{
            //         var ids02 = count02[0].id + 1;
            //       }
            //   } else {
            //     var ids02 = 1;
            //   }
            const pointstore1 = new pointTableModal({
              // id:ids02,
              app_id: "com.babaji.galigame",
              user_id: rec_id,
              transfer_user_id: req.body.user_id,
              transaction_id: tr_id,
              tr_nature: "TRDEPO002",
              tr_value: amount,
              tr_value_updated: ccoins,
              value_update_by: "Deposit",
              tr_value_type: "Credit",
              tr_device: req.body.devName,
              date: currentdate,
              date_time: currentdateTime,
              tr_remark: "transfer",
              tr_status: "Success",
              is_deleted: "0",
              device_type: devType,
              device_id: "",
              admin_key: "ADMIN0001",
              is_transfer: "1",
              t_mob: smob,
              transferByMob: smob,
              transferByName: sfullname,
              login_url: "babaclubs.in",
            });
            pointstore1.save();
            //  const count03 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
            //   if (count03.length>0) {

            //   var ids03 = count03[0].id + 1;
            // } else {
            //   var ids03 = 1;
            // }
            const wallettore1 = new walletReportModal({
              // id:ids03,
              transaction_id: tr_id,
              value_update_by: "Transfer",
              is_transfer: "1",
              type: "Credit",
              user_id: rec_id,
              transfer_user_id: req.body.user_id,
              app_id: "com.babaji.galigame",
              tr_nature: "TRDEPO002",
              tr_value: amount,
              tr_value_updated: ccoins,
              date: currentdate,
              date_time: currentdateTime,
              tr_status: "Success",
              tr_remark: "From-" + smob,
              login_url: "babaclubs.in",
            });
            wallettore1.save();
            await User.updateOne(
              {
                user_id: rec_id,
                app_id: "com.babaji.galigame",
              },
              {
                $set: {
                  win_amount: newcoins,
                },
              }
            );
            //  const count04 = await pointTableModal.find().sort({ id: 'desc' }).limit(1).exec();
            //   if (count04.length>0) {
            //   var ids04 = count04[0].id + 1;
            // } else {
            //   var ids04 = 1;
            // }
            const pointstore11 = new pointTableModal({
              // id:ids04,
              app_id: "com.babaji.galigame",
              user_id: req.body.user_id,
              transfer_user_id: rec_id,
              transaction_id: tr_id,
              tr_nature: "TRWITH003",
              tr_value: amount,
              tr_value_updated: newsenderCoin,
              value_update_by: "Withdraw",
              tr_value_type: "Debit",
              tr_device: req.body.devName,
              date: currentdate,
              date_time: currentdateTime,
              tr_remark: "transfer",
              tr_status: "Success",
              is_deleted: "0",
              device_type: devType,
              device_id: "",
              admin_key: "ADMIN0001",
              is_transfer: "1",
              t_mob: req.body.rec_mob,
              login_url: "babaclubs.in",
            });
            pointstore11.save();
            //  const count05 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
            //   if (count05.length>0) {
            //   var ids05 = count05[0].id + 1;
            // } else {
            //   var ids05 = 1;
            // }
            const wallettore11 = new walletReportModal({
              // id:ids05,
              transaction_id: tr_id,
              value_update_by: "Transfer",
              is_transfer: "1",
              type: "Debit",
              user_id: req.body.user_id,
              transfer_user_id: rec_id,
              app_id: "com.babaji.galigame",
              tr_nature: "TRWITH003",
              tr_value: amount,
              tr_value_updated: newsenderCoin,
              date: currentdate,
              date_time: currentdateTime,
              tr_status: "Success",
              tr_remark: "To-" + req.body.rec_mob,
              login_url: "babaclubs.in",
            });
            wallettore11.save();
            await User.updateOne(
              {
                user_id: req.body.user_id,
                app_id: "com.babaji.galigame",
              },
              {
                $set: {
                  win_amount: newamount,
                },
              }
            );
            return res.status(200).send({
              status: "1",
              message: "Amount has been transferred successfully",
            });
          } else {
            return res.status(200).send({
              status: "0",
              message:
                "You can transfer Minimum " +
                transfer_min +
                " and Maximum " +
                transfer_max,
            });
          }
        }
      } else {
        return res
          .status(200)
          .send({ status: "0", message: "Receiver account does not exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.single_market_result = async (req, res) => {
  try {
    const result = schemaSingleMarketResult.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const user = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
      });
      if (user) {
        const comxMarket = await comxMarketModel.findOne({
          market_id: req.body.market_id,
          app_id: req.body.app_id,
        });
        if (comxMarket) {
          const rows = {
            success: "1",
            message: "Successfully Markets Fetched",
            data: [],
          };
          var type = req.body.type;
          if (type == "1") {
            const sqlQuery = {
              market_id: req.body.market_id,
              app_id: req.body.app_id,
            };
            var resultTable = await resultTableModal
              .find(sqlQuery)
              .sort({ _id: -1 })
              .limit(50);
          } else if (type == "2") {
            var from = req.body.from;
            var to = req.body.to;

            if (from != "" || to == "") {
              const sqlQuery = {
                market_id: req.body.market_id,
                app_id: req.body.app_id,
                date: from,
              };
              var resultTable = await resultTableModal
                .find(sqlQuery)
                .sort({ _id: -1 });
            }
            if (from != "" && to != "to") {
              const sqlQuery = {
                market_id: req.body.market_id,
                app_id: req.body.app_id,
                date: { $gte: from, $lte: to },
              };
              var resultTable = await resultTableModal
                .find(sqlQuery)
                .sort({ _id: -1 });
            }
          }
          resultTable.forEach((resulttabl, i) => {
            const market = {
              result: resulttabl.toJSON().result,
              date: resulttabl.toJSON().date,
            };
            rows.data.push(market);
          });
          res.status(200).send(rows);
          return;
        } else {
          res
            .status(200)
            .send({ status: "0", message: "No Chart Result Found" });
          return;
        }
      } else {
        res
          .status(200)
          .send({ status: "0", message: "User Not Available Or Blocked" });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

/**
 * Month wise all market results in one response (table-friendly).
 * Input month examples: "2026-03", "03-2026", "March 2026"
 */
exports.all_game_results_by_month = async (req, res) => {
  try {
    const { error, value } = schemaAllGameResultsByMonth.validate(req.body || {}, {
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      return res.status(200).json({ success: "0", message: error.message });
    }

    const parsed = parseMonthFilter(value.month);
    if (!parsed) {
      return res.status(200).json({
        success: "0",
        message: "Invalid month. Use YYYY-MM, MM-YYYY, or MMMM YYYY.",
      });
    }

    const appId = String(value.app_id || "").trim();
    const monthSuffixRegex = new RegExp(`-${parsed.monthNumber}-${parsed.year}$`);

    const marketQuery = { is_deleted: { $ne: true } };
    if (appId) {
      marketQuery.app_id = appId;
    }

    const markets = await comxMarketModel
      .find(marketQuery)
      .sort({ market_position: 1, market_name: 1 })
      .select("market_id market_name")
      .lean();

    if (!markets.length) {
      return res.status(200).json({
        success: "0",
        message: "No markets found for this app.",
      });
    }

    const marketMap = {};
    const marketIds = [];
    for (const m of markets) {
      const id = String(m.market_id || "").trim();
      if (!id) continue;
      marketIds.push(id);
      marketMap[id] = String(m.market_name || id).trim();
    }

    const resultBaseQuery = {
      market_id: { $in: marketIds },
      date: { $regex: monthSuffixRegex },
    };
    let resultRows = [];
    let appFilterApplied = false;

    if (appId) {
      resultRows = await resultTableModal
        .find({ ...resultBaseQuery, app_id: appId })
        .select("date market_id result")
        .lean();
      appFilterApplied = true;
    }

    if (!resultRows.length) {
      resultRows = await resultTableModal
        .find(resultBaseQuery)
        .select("date market_id result")
        .lean();
    }

    const byDate = {};
    for (const row of resultRows) {
      const date = String(row.date || "").trim();
      const marketId = String(row.market_id || "").trim();
      if (!date || !marketId) continue;

      if (!byDate[date]) byDate[date] = { date };
      byDate[date][marketId] = String(row.result || "XX").trim() || "XX";
    }

    const sortedDates = Object.keys(byDate).sort((a, b) => {
      const da = moment(a, "DD-MM-YYYY", true);
      const db = moment(b, "DD-MM-YYYY", true);
      if (da.isValid() && db.isValid()) return da.valueOf() - db.valueOf();
      return a.localeCompare(b);
    });

    const data = sortedDates.map((d) => {
      const row = { date: d };
      for (const id of marketIds) {
        const key = marketMap[id];
        row[key] = byDate[d][id] || "XX";
      }
      return row;
    });

    return res.status(200).json({
      success: "1",
      message: "Month-wise all market results fetched successfully.",
      filter: {
        app_id: appId || null,
        month: parsed.monthLabel,
      },
      app_filter_applied: appFilterApplied,
      columns: ["date", ...marketIds.map((id) => marketMap[id])],
      total_days: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: "0", message: error.message });
  }
};

// exports.deduct_user_balance = async (req, res) => {
//   try {
//     const result = schemadeduct_user_balance.validate(req.body);
//     if (result.error) {
//       res.status(200).json({ message: result.error.message });
//     } else {
//       const user = await User.findOne({
//         user_id: req.body.userID,
//         app_id: req.body.Token,
//       });
//       if (user) {
//         var cod = req.body.cod;
//         var userBal = user.toJSON().credit;
//         if (cod == "SUCCESS") {
//           var UpdatedBalance =
//             parseInt(userBal) + parseInt(req.body.orderAmount);
//           const appController = await appControllerModal.findOne();
//           const currentDate = moment();
//           const currentdate = currentDate.format("DD-MM-YYYY");
//           const currentdateTime = currentDate.format("DD-MM-YYYY HH:mm:ss");
//           //  const count06 = await pointTableModal.find().sort({ id: 'desc' }).limit(1).exec();
//           //       if (count06.length>0) {
//           //       var ids06 = count06[0].id + 1;
//           //     } else {
//           //       var ids06 = 1;
//           //     }
//           const pointstore11 = new pointTableModal({
//             // id:ids06,
//             app_id: req.body.Token,
//             user_id: req.body.userID,
//             transaction_id: req.body.referenceId,
//             tr_nature: "TRDEPO002",
//             tr_value: req.body.orderAmount,
//             tr_value_updated: UpdatedBalance,
//             value_update_by: "Deposit",
//             tr_value_type: "Credit",
//             tr_device: req.body.devName,
//             date: currentdate,
//             date_time: currentdateTime,
//             tr_remark: "Online",
//             tr_status: "Pending",
//             is_deleted: "0",
//             device_type: req.body.devType,
//             device_id: req.body.devId,
//             admin_key: "ADMIN0001",
//             upi_id: appController.toJSON().upiId,
//           });
//           pointstore11.save();
//           //  const count07 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
//           //       if (count07.length>0) {

//           //       var ids07 = count07[0].id + 1;
//           //     } else {
//           //       var ids07 = 1;
//           //     }
//           const wallettore11 = new walletReportModal({
//             // id:ids07,
//             type: "Credit",
//             transaction_id: req.body.referenceId,
//             value_update_by: "Deposit",
//             user_id: req.body.user_id,
//             app_id: req.body.Token,
//             tr_nature: "TRDEPO002",
//             tr_value: req.body.orderAmount,
//             tr_value_updated: UpdatedBalance,
//             date: currentdate,
//             date_time: currentdateTime,
//             tr_status: "Pending",
//             tr_remark: "Online",
//           });
//           wallettore11.save();
//           res.status(200).send({ status: "1", message: req.body.txMsg });
//         } else {
//           const currentDate = moment();
//           // Format the date
//           const currentdate = currentDate.format("DD-MM-YYYY");
//           const currentdateTime = currentDate.format("DD-MM-YYYY HH:mm:ss");
//           //  const count08 = await usercoinModal.find().sort({ id: 'desc' }).limit(1).exec();
//           //       if (count08.length>0) {
//           //       var ids08 = count08[0].id + 1;
//           //     } else {
//           //       var ids08 = 1;
//           //     }
//           const usercoin = new usercoinModal({
//             // id:ids08,
//             user_id: req.body.user_id,
//             money: req.body.orderAmount,
//             transStatus: req.body.txStatus,
//             upiId: req.body.upiID,
//             TranID: req.body.orderId,
//             TDate: currentdateTime,
//           });
//           usercoin.save();
//           res.status(200).send({ status: "2", message: req.body.txMsg });
//           return;
//         }
//       } else {
//         res
//           .status(200)
//           .send({ status: "0", message: "User Not Available Or Blocked" });
//         return;
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     return;
//   }
// };
const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto
    ? String(forwardedProto).split(",")[0]
    : req.protocol;
  return `${protocol}://${req.get("host")}`;
};

/** Prefer payment/order fields over generic `status` (often ERROR / false while payment is PAID). */
const getProviderOrderStatus = (data = {}) => {
  const v =
    data?.payment_status ??
    data?.order_status ??
    data?.status_text ??
    data?.data?.payment_status ??
    data?.data?.order_status ??
    data?.data?.status ??
    data?.result?.payment_status ??
    data?.result?.order_status ??
    data?.result?.status ??
    data?.transaction_status ??
    data?.txn_status ??
    data?.status_text ??
    data?.status;
  return v != null && v !== "" ? v : "";
};

const isProviderSuccessStatus = (statusValue) => {
  if (statusValue === true) return true;
  const normalizedStatus = String(statusValue || "").trim().toUpperCase();
  return [
    "SUCCESS",
    "SUCCESSFUL",
    "COMPLETED",
    "PAID",
    "CAPTURED",
    "TRUE",
    "1",
    "OK",
    "APPROVED",
    "SETTLED",
    "DONE",
    "CLOSED",
  ].includes(normalizedStatus);
};

/** Extra IMB shapes: success flag, nested payment strings */
const inferImbPaymentSuccess = (d = {}) => {
  if (!d || typeof d !== "object") return false;

  const msg = String(d.message || d.msg || "");
  if (/\bnot found\b/i.test(msg) || /\binvalid\s+order\b/i.test(msg)) {
    return false;
  }

  if (d.success === true || d.success === 1 || String(d.success) === "1") {
    return true;
  }

  const blob = [
    d.payment_status,
    d.order_status,
    d.data?.payment_status,
    d.data?.order_status,
    d.result?.payment_status,
    d.status_text,
  ]
    .filter((x) => x != null && x !== "")
    .map((x) => String(x).toLowerCase())
    .join(" ");

  return /\b(paid|success|completed|captured|approved|settled|successful)\b/i.test(
    blob
  );
};

/** Merge nested string JSON (some gateways send data: "{...}") */
const normalizeImbPayload = (raw) => {
  let p = raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
  if (typeof raw === "string") {
    try {
      p = JSON.parse(raw);
    } catch {
      p = { raw };
    }
  }
  if (p.data != null && typeof p.data === "string") {
    try {
      const inner = JSON.parse(p.data);
      p = { ...p, ...inner, data: inner };
    } catch (_) {}
  }
  return p;
};

const extractImbOrderIdFromPayload = (p) => {
  if (!p || typeof p !== "object") return null;
  return (
    p.order_id ||
    p.orderId ||
    p.orderID ||
    p.merchant_order_id ||
    p.merchantOrderId ||
    p.moid ||
    p.merchantOrderID ||
    (p.data && (p.data.order_id || p.data.orderId)) ||
    null
  );
};

const imbCallbackIndicatesFailure = (p) => {
  if (!p || typeof p !== "object") return false;
  const msg = String(
    p.message || p.msg || p.response_message || p.responseMessage || ""
  ).toLowerCase();
  if (
    /\btransaction failed\b|\bpayment failed\b|\bfailed\b|\bfailure\b|\brejected\b|\bcancelled\b|\bcanceled\b|\bdeclined\b|\btimeout\b/i.test(
      msg
    )
  ) {
    if (/\b(success|paid|completed)\b/i.test(msg)) return false;
    return true;
  }
  const st = String(
    getProviderOrderStatus(p) || p.status || p.txStatus || ""
  ).toUpperCase();
  if (
    ["FAILED", "FAILURE", "REJECTED", "CANCELLED", "CANCELED", "ERROR"].includes(
      st
    )
  ) {
    return true;
  }
  if (p.success === false || p.success === 0 || String(p.success) === "0") {
    return true;
  }
  return false;
};

const imbCallbackIndicatesSuccess = (p) => {
  if (!p || typeof p !== "object") return false;
  if (imbCallbackIndicatesFailure(p)) return false;
  if (
    isProviderSuccessStatus(getProviderOrderStatus(p)) ||
    isProviderSuccessStatus(p.status) ||
    isProviderSuccessStatus(p.txStatus) ||
    isProviderSuccessStatus(p.cod)
  ) {
    return true;
  }
  if (inferImbPaymentSuccess(p)) return true;
  const msg = String(p.message || p.msg || "").toLowerCase();
  if (
    /\b(success|successful|paid|completed|captured)\b/i.test(msg) &&
    !/\bfail/i.test(msg)
  ) {
    return true;
  }
  return false;
};

/**
 * Webhook: use IMB callback body first (status), then fallback to check-order API.
 */
const applyImbWebhookToOrder = async (orderDoc, rawPayload, reqBody) => {
  const normalized = normalizeImbPayload(rawPayload);

  if (imbCallbackIndicatesFailure(normalized)) {
    const failMsg = String(
      normalized.message ||
        normalized.msg ||
        normalized.response_message ||
        "FAILED"
    ).slice(0, 500);
    await imbOrderModal.updateOne(
      { _id: orderDoc._id },
      {
        $set: {
          status: "FAILED",
          payment_status: failMsg,
          last_response: normalized,
          updated_at: new Date(),
        },
      }
    );
    return {
      order_id: String(orderDoc.order_id),
      status: "FAILED",
      is_success: false,
      ledger_message: null,
      credit_after: null,
      wallet_total: null,
      provider_message: failMsg,
      provider_data: normalized,
      source: "webhook_callback",
    };
  }

  if (imbCallbackIndicatesSuccess(normalized)) {
    const responseData = normalized;
    const providerStatus =
      getProviderOrderStatus(responseData) || "SUCCESS";
    const refId =
      responseData.referenceId ||
      responseData.transaction_id ||
      responseData.txn_id ||
      responseData.utr ||
      responseData.UTR ||
      responseData.upi_txn_id ||
      orderDoc.reference_id ||
      orderDoc.order_id;

    await imbOrderModal.updateOne(
      { _id: orderDoc._id },
      {
        $set: {
          payment_status: String(providerStatus),
          status: "PAID",
          reference_id: refId,
          last_response: normalized,
          updated_at: new Date(),
        },
      }
    );

    let ledgerMessage = null;
    let credit_after = null;
    let wallet_total = null;
    const user = await User.findOne({
      user_id: orderDoc.user_id,
      app_id: orderDoc.app_id,
    });
    if (user) {
      const ledger = await createDepositLedgerEntry({
        appId: orderDoc.app_id,
        userId: orderDoc.user_id,
        userCredit: user.toJSON().credit,
        orderAmount: Number(orderDoc.amount),
        referenceId: refId,
        devName: (reqBody || {}).devName || "WEB",
        devType: (reqBody || {}).devType || "web",
        devId: (reqBody || {}).devId || "WEB",
        txMsg: responseData.message || "Payment verified (webhook).",
        remark: "IMB_WEBHOOK",
        paymentMode: responseData.payment_mode || "Online",
        upiId: responseData.upiID || responseData.upi_id || null,
      });
      ledgerMessage = ledger.alreadyProcessed
        ? "Transaction already processed."
        : "Wallet credited successfully.";
      credit_after = ledger.credit_after;
      wallet_total = ledger.wallet_total;
    }

    return {
      order_id: String(orderDoc.order_id),
      status: providerStatus,
      is_success: true,
      ledger_message: ledgerMessage,
      credit_after,
      wallet_total,
      provider_message: responseData.message || null,
      provider_data: normalized,
      source: "webhook_callback",
    };
  }

  return syncImbOrderFromProvider({
    orderDoc,
    reqBody: reqBody || normalized,
    payloadSnapshot: normalized,
  });
};

const createDepositLedgerEntry = async ({
  appId,
  userId,
  userCredit,
  orderAmount,
  referenceId,
  devName,
  devType,
  devId,
  txMsg,
  remark,
  paymentMode,
  upiId,
}) => {
  const existingDeposit = await pointTableModal.findOne({
    app_id: appId,
    user_id: userId,
    tr_nature: "TRDEPO002",
    transaction_id: referenceId,
  });
  if (existingDeposit) {
    const u = await User.findOne({ user_id: userId, app_id: appId });
    const walletTotal = u
      ? parseInt(u.credit || 0) + parseInt(u.win_amount || 0)
      : null;
    return {
      alreadyProcessed: true,
      updatedBalance: existingDeposit.tr_value_updated,
      credit_after: u ? u.credit : null,
      wallet_total: walletTotal,
    };
  }

  const updatedBalance = parseInt(userCredit || 0) + parseInt(orderAmount || 0);
  const appController = await appControllerModal.findOne({ app_id: appId });
  const fallbackAppController =
    appController || (await appControllerModal.findOne());
  const now = moment();
  const currentdate = now.format("DD-MM-YYYY");
  const currentdateTime = now.format("DD-MM-YYYY HH:mm:ss");

  const pointstore11 = new pointTableModal({
    app_id: appId,
    user_id: userId,
    transaction_id: referenceId,
    tr_nature: "TRDEPO002",
    tr_value: orderAmount,
    tr_value_updated: updatedBalance,
    value_update_by: "Deposit",
    tr_value_type: "Credit",
    tr_device: devName || "WEB",
    date: currentdate,
    date_time: currentdateTime,
    tr_remark: remark || "Online",
    tr_status: "Success",
    is_deleted: "0",
    device_type: devType || "web",
    device_id: devId || "WEB",
    admin_key: "ADMIN0001",
    upi_id: fallbackAppController ? fallbackAppController.toJSON().upiId : null,
  });

  const wallettore11 = new walletReportModal({
    type: "Credit",
    transaction_id: referenceId,
    value_update_by: "Deposit",
    user_id: userId,
    app_id: appId,
    tr_nature: "TRDEPO002",
    tr_value: orderAmount,
    tr_value_updated: updatedBalance,
    date: currentdate,
    date_time: currentdateTime,
    tr_status: "Success",
    tr_remark: remark || "Online",
  });

  await pointstore11.save();
  await wallettore11.save();

  const amt = parseInt(orderAmount || 0);
  if (amt > 0) {
    await User.updateOne(
      { user_id: userId, app_id: appId },
      { $inc: { credit: amt } }
    );
  }

  const userAfter = await User.findOne({ user_id: userId, app_id: appId });
  const walletTotal = userAfter
    ? parseInt(userAfter.credit || 0) + parseInt(userAfter.win_amount || 0)
    : updatedBalance;

  return {
    alreadyProcessed: false,
    updatedBalance,
    credit_after: userAfter ? userAfter.credit : updatedBalance,
    wallet_total: walletTotal,
    message: txMsg || "Deposit request created.",
    paymentMode: paymentMode || "Online",
    upiId: upiId || null,
  };
};

const syncImbOrderFromProvider = async ({
  orderDoc,
  reqBody = {},
  payloadSnapshot = null,
}) => {
  const orderId = String(orderDoc.order_id || ""); 
  if (!orderId) {
    await imbOrderModal.updateOne(
      { _id: orderDoc._id },
      {
        $set: {
          status: "PENDING",
          payment_status: "TOKEN_MISSING",
          last_response: payloadSnapshot || reqBody || null,
          updated_at: new Date(),
        },
      }
    );
    return {
      order_id: orderId || null,
      status: "TOKEN_MISSING",
      is_success: false,
      ledger_message: null,
      source: "check_order_api",
    };
  }

  const providerResponse = await fetchImbCheckOrderStatus({
    user_token: orderDoc.user_token || IMB_USER_TOKEN,
    order_id: orderId,
  });

  const responseData = providerResponse?.data || {};
  const providerStatus = getProviderOrderStatus(responseData);
  const isSuccess =
    isProviderSuccessStatus(providerStatus) ||
    inferImbPaymentSuccess(responseData);
  const refId =
    responseData?.referenceId ||
    responseData?.transaction_id ||
    responseData?.txn_id ||
    orderDoc.reference_id ||
    orderId;

  await imbOrderModal.updateOne(
    { _id: orderDoc._id },
    {
      $set: {
        payment_status: String(providerStatus || "UNKNOWN"),
        status: isSuccess ? "PAID" : "PENDING",
        reference_id: refId,
        last_response: payloadSnapshot || responseData,
        updated_at: new Date(),
      },
    }
  );

  let ledgerMessage = null;
  let credit_after = null;
  let wallet_total = null;
  if (isSuccess) {
    const user = await User.findOne({
      user_id: orderDoc.user_id,
      app_id: orderDoc.app_id,
    });
    if (user) {
      const ledger = await createDepositLedgerEntry({
        appId: orderDoc.app_id,
        userId: orderDoc.user_id,
        userCredit: user.toJSON().credit,
        orderAmount: Number(orderDoc.amount),
        referenceId: refId,
        devName: reqBody.devName || "WEB",
        devType: reqBody.devType || "web",
        devId: reqBody.devId || "WEB",
        txMsg: responseData?.message || "Payment verified.",
        remark: "IMB",
        paymentMode: responseData?.payment_mode || "Online",
        upiId: responseData?.upiID || responseData?.upi_id || null,
      });
      ledgerMessage = ledger.alreadyProcessed
        ? "Transaction already processed."
        : "Wallet credited successfully.";
      credit_after = ledger.credit_after;
      wallet_total = ledger.wallet_total;
    }
  }

  return {
    order_id: orderId,
    status: providerStatus || "UNKNOWN",
    is_success: isSuccess,
    ledger_message: ledgerMessage,
    credit_after,
    wallet_total,
    provider_message: responseData?.message || null,
    provider_data: responseData,
    source: "check_order_api",
  };
};

/** Bina order_id — DB se pending (optional: failed) orders utha kar IMB check-order se sync */
const runImbPendingOrdersSync = async ({
  limit = 500,
  reqBody = {},
  app_id = null,
  include_failed = false,
}) => {
  const cap = Math.min(Math.max(parseInt(limit, 10) || 500, 1), 5000);
  const statusList = include_failed
    ? ["CREATED", "PENDING", "FAILED"]
    : ["CREATED", "PENDING"];
  const q = { status: { $in: statusList } };
  if (app_id && String(app_id).trim() !== "") {
    q.app_id = String(app_id).trim();
  }
  const pendingOrders = await imbOrderModal
    .find(q)
    .sort({ updated_at: 1, created_at: 1 })
    .limit(cap);

  const results = [];
  for (const orderDoc of pendingOrders) {
    try {
      const result = await syncImbOrderFromProvider({
        orderDoc,
        reqBody,
        payloadSnapshot: reqBody,
      });
      results.push({
        order_id: result.order_id,
        status: result.status,
        is_success: result.is_success,
        ledger_message: result.ledger_message,
        credit_after: result.credit_after,
        wallet_total: result.wallet_total,
        provider_message: result.provider_message,
        source: result.source,
      });
    } catch (syncErr) {
      results.push({
        order_id: String(orderDoc.order_id),
        status: "ERROR",
        is_success: false,
        error: syncErr.message,
      });
    }
  }

  return {
    synced_count: results.length,
    scanned: pendingOrders.length,
    results,
  };
};

exports.imb_list_orders = async (req, res) => {
  try {
    const { error, value } = schemaImbListOrders.validate(req.body || {}, {
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      return res.status(400).json({ success: "0", message: error.message });
    }

    const page = value.page || 1;
    const pageSize = Math.min(value.page_size || 100, 500);
    const query = {};
    if (value.app_id && String(value.app_id).trim() !== "") {
      query.app_id = String(value.app_id).trim();
    }
    if (value.status && String(value.status).toLowerCase() !== "all") {
      query.status = String(value.status).trim();
    }

    const skip = (page - 1) * pageSize;
    const [rows, total] = await Promise.all([
      imbOrderModal
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .select(
          "order_id user_id user_temp_id app_id amount status payment_status reference_id payment_url created_at updated_at"
        )
        .lean(),
      imbOrderModal.countDocuments(query),
    ]);

    return res.status(200).json({
      success: "1",
      total,
      page,
      page_size: pageSize,
      data: rows,
    });
  } catch (e) {
    return res.status(500).json({
      success: "0",
      message: e.message || "Unable to list orders.",
    });
  }
};

exports.imb_sync_pending_orders = async (req, res) => {
  try {
    const { error, value } = schemaImbSyncPending.validate(
      coerceImbSyncPendingBody(req.body || {}),
      {
        stripUnknown: true,
        convert: true,
      }
    );
    if (error) {
      return res.status(400).json({ success: "0", message: error.message });
    }

    const limit = value.sync_all ? 5000 : value.limit || 500;
    const out = await runImbPendingOrdersSync({
      limit,
      reqBody: req.body || {},
      app_id: value.app_id || null,
      include_failed: value.include_failed === true,
    });

    return res.status(200).json({
      success: "1",
      message: "Pending order sync completed.",
      limit_used: Math.min(Math.max(parseInt(limit, 10) || 500, 1), 5000),
      include_failed: value.include_failed === true,
      ...out,
    });
  } catch (e) {
    return res.status(500).json({
      success: "0",
      message: e.message || "Unable to sync pending orders.",
    });
  }
};

exports.deduct_user_balance = async (req, res) => {
  try {
    const result = schemadeduct_user_balance.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    }

    const userId = req.body.userID;
    const appId = req.body.Token;
    const user = await User.findOne({
      user_id: userId,
      app_id: appId,
    });

    if (!user) {
      res
        .status(200)
        .send({ status: "0", message: "User Not Available Or Blocked" });
      return;
    }

    if (String(req.body.cod).toUpperCase() === "SUCCESS") {
      const ledger = await createDepositLedgerEntry({
        appId,
        userId,
        userCredit: user.toJSON().credit,
        orderAmount: req.body.orderAmount,
        referenceId: req.body.referenceId || req.body.orderId,
        devName: req.body.devName,
        devType: req.body.devType,
        devId: req.body.devId,
        txMsg: req.body.txMsg,
        remark: "Online",
        paymentMode: req.body.paymentMode,
        upiId: req.body.upiID,
      });

      res.status(200).send({
        status: "1",
        message: ledger.alreadyProcessed
          ? "Transaction already processed."
          : req.body.txMsg,
      });
      return;
    }

    const currentdateTime = moment().format("DD-MM-YYYY HH:mm:ss");
    const usercoin = new usercoinModal({
      user_id: userId,
      money: req.body.orderAmount,
      transStatus: req.body.txStatus,
      upiId: req.body.upiID,
      TranID: req.body.orderId,
      TDate: currentdateTime,
    });
    await usercoin.save();
    res.status(200).send({ status: "2", message: req.body.txMsg });
    return;
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.create_imb_order = async (req, res) => {
  try {
    const validation = schemaCreateImbOrder.validate(req.body || {}, {
      convert: true,
    });
    if (validation.error) {
      return res.status(400).json({ success: "0", message: validation.error.message });
    }

    const user = await User.findOne({
      user_id: req.body.user_id,
      app_id: req.body.app_id,
      user_status: { $in: [1, "1"] },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: "0", message: "User Not Available Or Blocked" });
    }

    const userJson = user.toJSON();
    let userTempId =
      req.body.user_temp_id && String(req.body.user_temp_id).trim() !== ""
        ? String(req.body.user_temp_id).trim()
        : null;
    const userMob = String(
      req.body.customer_mobile || userJson.mob || ""
    ).trim();

    if (!userTempId && userMob) {
      const utByMob = await userTempModal.findOne({ mob: userMob });
      if (utByMob) {
        userTempId = String(utByMob._id);
      }
    } else if (userTempId) {
      if (!mongoose.Types.ObjectId.isValid(userTempId)) {
        userTempId = null;
      } else {
        const utById = await userTempModal.findById(userTempId);
        if (!utById) {
          userTempId = null;
        }
      }
    }

    const generatedOrderId =
      req.body.order_id || `${String(req.body.user_id)}${Date.now()}`;
    const webhookUrl =
      req.body.webhook_url || `${getRequestBaseUrl(req)}/imb-api/api/webhook`;
    const payload = {
      customer_mobile:
        req.body.customer_mobile || String(user.toJSON().mob || ""),
      user_token: IMB_USER_TOKEN,
      amount: String(req.body.amount),
      order_id: generatedOrderId,
      redirect_url: req.body.redirect_url || "",
      remark1: req.body.remark1 || "",
      remark2: req.body.remark2 || "",
      webhook_url: webhookUrl,
    };

    const response = await axios.post(
      `${IMB_BASE_URL}${IMB_CREATE_ORDER_PATH}`,
      querystring.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        timeout: 20000,
      }
    );

    const responseData = response?.data || {};
    const providerStatus = getProviderOrderStatus(responseData) || "CREATED";
    const paymentUrl =
      responseData?.payment_url ||
      responseData?.payment_link ||
      responseData?.pay_url ||
      responseData?.url ||
      responseData?.redirect_url ||
      null;

    await imbOrderModal.findOneAndUpdate(
      { order_id: generatedOrderId },
      {
        $set: {
          order_id: generatedOrderId,
          user_id: req.body.user_id,
          user_temp_id: userTempId,
          app_id: req.body.app_id,
          amount: Number(req.body.amount),
          user_token: IMB_USER_TOKEN,
          status: "CREATED",
          payment_status: String(providerStatus),
          payment_url: paymentUrl,
          webhook_url: webhookUrl,
          last_response: responseData,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );

    if (userTempId) {
      await userTempModal.updateOne(
        { _id: userTempId },
        {
          $set: {
            user_id: req.body.user_id,
            imb_last_order_id: generatedOrderId,
            updated_at: new Date(),
          },
        }
      );
    }

    return res.status(200).json({
      success: "1",
      message: responseData?.message || "Order created successfully.",
      order_id: generatedOrderId,
      user_id: req.body.user_id,
      user_temp_id: userTempId,
      webhook_url: webhookUrl,
      ...responseData,
    });
  } catch (error) {
    const providerMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to create payment order.";
    return res.status(502).json({
      success: "0",
      message: providerMessage,
      provider_response: error?.response?.data || null,
    });
  }
};

exports.check_imb_order_status = async (req, res) => {
  try {
    const order_id = normalizeImbOrderId(req.body.order_id);
    if (!order_id) {
      return res.status(400).json({
        success: "0",
        message:
          "Invalid order_id. Use the string returned from create-order (e.g. res.order_id). Do not pass an object — use String(orderId) or orderId?.order_id.",
      });
    }

    const validation = schemaImbOrderStatus.validate(
      {
        ...req.body,
        order_id,
      },
      { convert: true }
    );
    if (validation.error) {
      return res.status(400).json({ success: "0", message: validation.error.message });
    }

    const localOrder = await imbOrderModal.findOne({ order_id });

    if (localOrder) {
      const syncResult = await syncImbOrderFromProvider({
        orderDoc: localOrder,
        reqBody: req.body,
      });
      const pdata = syncResult.provider_data || {};
      return res.status(200).json({
        success: "1",
        message: pdata?.message || "Status fetched",
        order_id,
        status: syncResult.status,
        is_success: syncResult.is_success,
        ledger_message: syncResult.ledger_message,
        credit_after: syncResult.credit_after,
        wallet_total: syncResult.wallet_total,
        provider_message: syncResult.provider_message,
        data: pdata,
      });
    }

    const response = await fetchImbCheckOrderStatus({
      user_token: req.body.user_token || IMB_USER_TOKEN,
      order_id,
    });
    const responseData = response?.data || {};
    const providerStatus = getProviderOrderStatus(responseData);
    const isSuccess =
      isProviderSuccessStatus(providerStatus) ||
      inferImbPaymentSuccess(responseData);

    return res.status(200).json({
      success: "1",
      message: responseData?.message || "Status fetched",
      order_id,
      status: providerStatus || "UNKNOWN",
      is_success: isSuccess,
      ledger_message: null,
      credit_after: null,
      wallet_total: null,
      provider_message: responseData?.message || null,
      data: responseData,
    });
  } catch (error) {
    const providerMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to check order status.";
    return res.status(502).json({
      success: "0",
      message: providerMessage,
      provider_response: error?.response?.data || null,
    });
  }
};

/** GET: browser/health check — webhook must be called with POST */
exports.imb_payment_webhook_info = (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  return res.status(200).json({
    success: "1",
    message:
      "IMB webhook & helpers: POST (JSON/form) ya GET (query) dono. Khali GET = ye help JSON.",
    post: {
      content_type: "application/json or application/x-www-form-urlencoded",
      webhook_single_or_sync: `${base}/api/users/imb-payment-webhook`,
    },
    get_examples: {
      webhook_help: `${base}/api/users/imb-payment-webhook`,
      webhook_sync_pending: `${base}/api/users/imb-payment-webhook?limit=50&sync_all=true`,
      webhook_one_order: `${base}/api/users/imb-payment-webhook?order_id=ORDER_ID_HERE`,
      list_orders: `${base}/api/users/imb-list-orders?page=1&page_size=100`,
      sync_pending: `${base}/api/users/imb-sync-pending-orders?sync_all=true`,
      check_status: `${base}/api/users/imb-check-order-status?order_id=ORDER_ID_HERE`,
      create_order:
        `${base}/api/users/imb-create-order?user_id=UID&app_id=APP&amount=100`,
    },
    public_imb_api: {
      webhook_get: `${base}/imb-api/api/webhook`,
      webhook_post: `${base}/imb-api/api/webhook`,
      create_get: `${base}/imb-api/api/create-order`,
      create_post: `${base}/imb-api/api/create-order`,
      check_get: `${base}/imb-api/api/check-order-status`,
      check_post: `${base}/imb-api/api/check-order-status`,
      list_get: `${base}/imb-api/api/list-orders`,
      sync_get: `${base}/imb-api/api/sync-pending-orders`,
    },
  });
};

exports.imb_payment_webhook = async (req, res) => {
  try {
    const q = req.query && typeof req.query === "object" ? req.query : {};
    let merged = { ...q };
    if (req.body != null) {
      if (typeof req.body === "string") {
        try {
          Object.assign(merged, JSON.parse(req.body));
        } catch {
          merged._raw_body = req.body;
        }
      } else if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
        Object.assign(merged, req.body);
      }
    }
    const payload = normalizeImbPayload(merged);
    const orderId = extractImbOrderIdFromPayload(payload);
    if (orderId) {
      const localOrder = await imbOrderModal.findOne({ order_id: String(orderId) });
      if (!localOrder) {
        return res.status(200).json({
          success: "1",
          message: "Webhook received. Local order not found.",
          order_id: String(orderId),
        });
      }

      const result = await applyImbWebhookToOrder(localOrder, payload, payload);

      return res.status(200).json({
        success: "1",
        message: "Webhook processed successfully.",
        order_id: String(orderId),
        status: result.status,
        is_success: result.is_success,
        ledger_message: result.ledger_message,
        credit_after: result.credit_after,
        wallet_total: result.wallet_total,
        provider_message: result.provider_message,
        source: result.source,
      });
    }

    const syncLimit = payload.sync_all
      ? 5000
      : Math.max(1, Math.min(parseInt(payload.limit || 20, 10), 5000));
    const syncOut = await runImbPendingOrdersSync({
      limit: syncLimit,
      reqBody: payload,
      app_id: payload.app_id || null,
    });

    if (!syncOut.scanned) {
      return res.status(200).json({
        success: "1",
        message: "No pending orders found for sync.",
        synced_count: 0,
        scanned: 0,
        results: [],
      });
    }

    return res.status(200).json({
      success: "1",
      message: "Pending order sync completed.",
      limit_used: syncLimit,
      synced_count: syncOut.synced_count,
      scanned: syncOut.scanned,
      results: syncOut.results,
    });
  } catch (error) {
    return res.status(500).json({
      success: "0",
      message: error.message || "Unable to process webhook.",
    });
  }
};

const normalizeImbQueryFlags = (q) => {
  const o = { ...(q || {}) };
  if (o.sync_all === "true" || o.sync_all === "1") o.sync_all = true;
  if (o.sync_all === "false" || o.sync_all === "0") o.sync_all = false;
  return o;
};

const IMB_GET_WEBHOOK_ACTION_KEYS = [
  "order_id",
  "orderId",
  "orderID",
  "merchant_order_id",
  "merchantOrderId",
  "moid",
  "limit",
  "sync_all",
  "app_id",
];

/** GET: bina body — query se webhook / pending sync (browser / curl GET) */
exports.imb_payment_webhook_get = async (req, res) => {
  const rawQ = req.query || {};
  const hasAction = IMB_GET_WEBHOOK_ACTION_KEYS.some(
    (k) => rawQ[k] != null && String(rawQ[k]).trim() !== ""
  );
  if (!hasAction) {
    return exports.imb_payment_webhook_info(req, res);
  }
  req.body = normalizeImbQueryFlags(rawQ);
  return exports.imb_payment_webhook(req, res);
};

exports.imb_list_orders_get = (req, res) => {
  req.body = normalizeImbQueryFlags(req.query || {});
  return exports.imb_list_orders(req, res);
};

exports.imb_sync_pending_orders_get = (req, res) => {
  req.body = normalizeImbQueryFlags(req.query || {});
  return exports.imb_sync_pending_orders(req, res);
};

/**
 * GET-only webhook: pending + FAILED orders ko IMB se verify karke status update;
 * PAID par user wallet credit (same ledger flow as sync).
 * Optional: set env IMB_GET_SYNC_WEBHOOK_KEY — then require ?key=... on every call.
 */
exports.imb_get_payment_sync_webhook = async (req, res) => {
  try {
    const envKey = process.env.IMB_GET_SYNC_WEBHOOK_KEY;
    if (envKey != null && String(envKey).trim() !== "") {
      const qKey = req.query && req.query.key;
      if (String(qKey || "") !== String(envKey)) {
        return res.status(403).json({
          success: "0",
          message: "Forbidden: invalid or missing key query param.",
        });
      }
    }

    const merged = coerceImbSyncPendingBody({ ...(req.query || {}) });
    const { error, value } = schemaImbSyncPending.validate(merged, {
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      return res.status(400).json({ success: "0", message: error.message });
    }

    const limit = value.sync_all ? 5000 : value.limit || 500;
    const out = await runImbPendingOrdersSync({
      limit,
      reqBody: merged,
      app_id: value.app_id || null,
      include_failed: true,
    });

    return res.status(200).json({
      success: "1",
      message:
        "GET sync webhook: CREATED/PENDING/FAILED orders checked with IMB; wallet credited if paid.",
      include_failed: true,
      limit_used: Math.min(Math.max(parseInt(limit, 10) || 500, 1), 5000),
      ...out,
    });
  } catch (e) {
    return res.status(500).json({
      success: "0",
      message: e.message || "GET sync webhook failed.",
    });
  }
};

exports.imb_check_order_status_get = (req, res) => {
  req.body = { ...(req.query || {}) };
  return exports.check_imb_order_status(req, res);
};

exports.all_game_results_by_month_get = (req, res) => {
  req.body = { ...(req.query || {}) };
  return exports.all_game_results_by_month(req, res);
};

exports.imb_create_order_get = (req, res) => {
  req.body = normalizeImbQueryFlags(req.query || {});
  return exports.create_imb_order(req, res);
};

// exports.app_manager = async (req, res) => {
//   try {
//     const result = schemaapp_manager.validate(req.body);

//     if (result.error) {
//       return res.status(200).json({ message: result.error.message });
//     }

//     const user = await User.findOne({
//       user_id: req.body.user_id,
//       app_id: req.body.app_id,
//       user_status: "1",
//     });

//     if (!user) {
//       return res
//         .status(200)
//         .send({ status: "0", message: "User Not Available Or Blocked" });
//     }

//     const appController = await appControllerModal.findOne({
//       app_id: req.body.app_id,
//     });


//     // Proceed with payment_setting lookup after sending response
//     const sqlQuery = {
//       status: "1",
//       app_id: req.body.app_id,
//     };

//     const payment_setting = await payment_settingModal
//       .findOne(sqlQuery)
//       .select("getaway")
//       .limit(1);

//     if (!payment_setting) {
//       console.log("Data Not Exists");
//       return;
//     }

//     var gv = payment_setting.toJSON().getaway;


//     const rows = {
//       success: "1",
//       message: "Balance Fetched Successfully",
//       logout: "0",
//       crossingmin: 5,
//       data: {appController,payment_getway:gv},
//     };

//     res.status(200).send(rows); // Response is sent here, make sure no further response is sent.




//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


exports.app_manager = async (req, res) => {
  try {
    const { error } = schemaapp_manager.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { user_id, app_id } = req.body;

    const user = await User.findOne({
      user_id,
      app_id,
      user_status: "1",
    });

    if (!user) {
      return res.status(200).json({
        status: "0",
        message: "User Not Available Or Blocked",
      });
    }

    const [appController, payment_settingByApp] = await Promise.all([
      appControllerModal.findOne({ app_id }),
      payment_settingModal.findOne({ status: "1"})
    ]);

     

    // const gateway = payment_settingByApp
    //   .map((p) => p?.getaway)
    //   .filter((value) => value !== undefined && value !== null && value !== "");
 

    return res.status(200).json({
      success: "1",
      message: "App Data Fetched Successfully",
      logout: "0",
      crossingmin: appController?.crossingMin || 0,
      data: {
        appController: appController || {},
        gateway:payment_settingByApp
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: "0",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// exports.app_manager = async (req, res) => {

//   try {
//     const result = schemaapp_manager.validate(req.body);

//     if (result.error) {
//       res.status(200).json({ message: result.error.message });
//     } else {
//       const user = await User.findOne({
//         _id: req.body.user_id,
//         app_id: req.body.app_id,
//         user_status: "1",
//       });
//       if (user) {
//         var cod = req.body.cod;
//         var userBal = user.toJSON().credit;
//         const appController = await appControllerModal.findOne({
//           app_status: "LIVE",
//           app_id: req.body.app_id,
//         });
//         const rows = {
//           success: "1",
//           message: "Balance Fetched Successfully",
//           logout: "0",
//           crossingmin: 5,
//           data: appController,
//         };
//         res.status(200).send(rows);
//         const sqlQuery = {
//           status: "1",
//           app_id: req.body.appId,
//         };
//         const payment_setting = await payment_settingModal
//           .findOne(sqlQuery)
//           .select("getaway")
//           .limit(1);
//         var gv = payment_setting.toJSON().getaway;
//         if (payment_setting) {
//         } else {
//           const market = {
//             message: "Data Not Exits",
//             success: "2",
//           };
//           res.status(200).send(market);
//           return;
//         }
//       } else {
//         res
//           .status(200)
//           .send({ status: "0", message: "User Not Available Or Blocked" });
//         return;
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     return;
//   }
// };

exports.add_account = async (req, res) => {
  try {
    const result = schemaadd_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      var bank_name = req.body.bank_name;
      var account_holder = req.body.account_holder;
      var account_no = req.body.ac_number;
      var ifsc = req.body.ifsc;
      const user_withdraw = await user_withdrawModal.find({
        user_id: req.body.user_id,
        account_no: account_no,
      });
      if (user_withdraw.length == 0) {
        const user_withdraw1 = await user_withdrawModal.find({
          user_id: req.body.user_id,
        });
        if (user_withdraw1.length > 1) {
          const rows = {
            success: "0",
            message: "Minimum 2 Account Add",
            count: user_withdraw1.length,
          };
          res.status(200).send(rows);
          return;
        }
        //  const count09 = await user_withdrawModal.find().sort({ id: 'desc' }).limit(1).exec();
        //         if (count09.length>0) {
        //         var ids09 = count09[0].id + 1;
        //       } else {
        //         var ids09 = 1;
        //       }
        const pointstore11 = new user_withdrawModal({
          // id:ids09,
          bank_name: bank_name,
          account_holder: account_holder,
          account_no: account_no,
          ifsc: ifsc,
          user_id: req.body.user_id,
        });
        pointstore11.save();
        const user_withdraw11 = await user_withdrawModal.find({
          user_id: req.body.user_id,
        });
        const rows = {
          success: "1",
          message: "Account Created Successfully",
          count: user_withdraw11.length,
        };
        res.status(200).send(rows);
        return;
      } else {
        const user_withdraw111 = await user_withdrawModal.find({
          user_id: req.body.user_id,
        });
        const rows = {
          success: "0",
          message: "Already registered",
          count: user_withdraw111.length,
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.addMsgGroup = async (req, res) => {
  try {
    const result = schemaaddMsgGroup.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const user = await User.findOne({
        user_id: req.body.user_id,
        game_host: "0",
      });
      if (user) {
        const rows = {
          success: "0",
          message:
            "अगर आपकी अच्छी गैसिंग है और आप पोस्ट करना चाहते हैं तो बाबा जी से परमिशन लो",
        };
        res.status(200).send(rows);
        return;
      } else {
        const user1 = await User.findOne({
          user_id: req.body.user_id,
        });
        // const count10 = await groupMSgModal.find().sort({ id: 'desc' }).limit(1).exec();
        //         if (count10.length>0) {
        //         var ids10 = count10[0].id + 1;
        //       } else {
        //         var ids10 = 1;
        //       }
        const pointstore11 = new groupMSgModal({
          // id:ids10,
          name: user1.toJSON().FullName,
          user_id: req.body.user_id,
          message: req.body.message,
        });
        pointstore11.save();
        const rows = {
          success: "1",
          message: "Message send Successfully",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

const chkOtpViaUrl = async (requestid, otp) => {
  try {
    const FormData = require("form-data");
    let data = new FormData();
    data.append("key", "jeTwMY1uOURMMXBxW6wvQiiwBUNKgzVYxlVrPaEkbakCpUwDCuBy");
    data.append("otp", otp);
    data.append("requestId", requestid);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://a2technosoft.services/api/v1/sms-check-otp",
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data.message;
  } catch (error) {
    console.error("OTP sending error:", error);
    return null;
  }
};

// exports.deduct_withdrawweb = async (req, res) => {
//   try {
//     const result = schemadeduct_withdrawweb.validate(req.body);
//     if (result.error) {
//       res.status(200).json({ message: result.error.message });
//     } else {
//       const users = await User.findOne({
//         user_id: req.body.user_id,
//       });

//       const userTemps = await userTempModal.findOne({
//         mob: users.mob,
//       });

//       var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
//       if (reqiestid == "Invalid otp") {
//         return res.status(200).json({
//           success: "3",
//           message: "Invalid Otp",
//         });
//       }
//       const appController = await appControllerModal.findOne();
//       if (appController.toJSON().redeem == 0) {
//         const rows = {
//           success: "1",
//           message: "Withdraw Closed",
//         };
//         res.status(200).send(rows);
//       } else {
//         const user1 = await User.findOne({
//           user_id: req.body.user_id,
//           app_id: req.body.app_id,
//           user_status: "1",
//         });
//         const add_bank_accountcount = await add_bank_account.countDocuments({
//           user_id: req.body.user_id,
//           account_number: req.body.account_number,
//         });
//         if (add_bank_accountcount == 0) {
//           return res.status(200).json({
//             success: "3",
//             message: "Invalid Details",
//           });
//         }
//         const accountNumber = String(req.body.account_number).replace(
//           /\s/g,
//           ""
//         );
//         const redAccountList1 = await redAccountList.findOne({
//           ac_number: accountNumber,
//         });
//         var is_fake = 0;
//         if (redAccountList1) {
//           var is_fake = 1;
//         }
//         const appController1 = await appControllerModal.findOne({
//           app_id: req.body.app_id,
//           admin_status: 1,
//         });
//         if (appController1) {
//           if (user1) {
//             var userBal = user1.toJSON().win_amount;
//             var minRedeem = appController1.toJSON().min_redeem;
//             var bal_req = req.body.amount;
//             if (bal_req >= minRedeem) {
//               if (userBal >= bal_req) {
//                 var UpdatedBalance = userBal - bal_req;
//                 var wincredit =
//                   user1.toJSON().win_amount + user1.toJSON().credit;
//                 var newAmount = wincredit - bal_req;
//                 var tr_id =
//                   Math.random().toString(36).substring(2, 15) +
//                   Math.random().toString(36).substring(2, 15);
//                 var transactiniid =
//                   (Math.random() + " ").substring(2, 10) +
//                   (Math.random() + " ").substring(2, 10);
//                 const currentDate = moment();
//                 // Format the date
//                 const currentdate = currentDate.format("DD-MM-YYYY");
//                 const currentdateTime = currentDate.format(
//                   "DD-MM-YYYY HH:mm:ss"
//                 );

//                 if (user1.toJSON().FullName) {
//                   var name = user1.toJSON().FullName;
//                 } else {
//                   var name = "NA";
//                 }
//                 const deductwith = new deduct_withrawModal({
//                   mob: user1.toJSON().mob,
//                   name: name,
//                   bank_name: req.body.bank_name,
//                   account_holder: req.body.account_holder,
//                   account_number: req.body.account_number,
//                   ifsc_code: req.body.ifsc_code,
//                   app_id: req.body.app_id,
//                   user_id: req.body.user_id,
//                   tr_value: bal_req,
//                   transaction_id: tr_id,
//                   is_fake: is_fake,
//                   login_url: "khelogalifaridabad.com",
//                 });
//                 deductwith.save();
//                 const wallettore11 = new walletReportModal({
//                   type: "Debit",
//                   transaction_id: tr_id,
//                   value_update_by: "Withdraw",
//                   user_id: req.body.user_id,
//                   app_id: req.body.app_id,
//                   tr_nature: "TRWITH003",
//                   tr_value: bal_req,
//                   tr_value_updated: newAmount,
//                   date: currentdate,
//                   date_time: currentdateTime,
//                   tr_status: "Pending",
//                   tr_remark: "A/C Withdraw",
//                 });
//                 wallettore11.save();
//                 await User.updateOne(
//                   {
//                     user_id: req.body.user_id,
//                   },
//                   {
//                     $set: {
//                       win_amount: UpdatedBalance,
//                     },
//                   }
//                 );
//                 const chkUserWithdraw = await user_withdrawModal.find({
//                   account_no: req.body.account_number,
//                   user_id: req.body.user_id,
//                 });
//                 if (chkUserWithdraw.length == 0) {
//                   const wallettore11 = new user_withdrawModal({

//                     bank_name: req.body.bank_name,
//                     account_holder: req.body.account_holder,
//                     account_no: req.body.account_number,
//                     user_id: req.body.user_id,
//                     ifsc: req.body.ifsc_code,
//                   });
//                   wallettore11.save();
//                 }
//                 const rows = {
//                   success: 1,
//                   message: "Withdraw Request Successfully Created",
//                 };
//                 res.status(200).send(rows);
//                 return;
//               } else {
//                 const rows = {
//                   success: "2",
//                   message: "Withdraw Request Failed OR InSufficient Balance",
//                 };
//                 res.status(200).send(rows);
//                 return;
//               }
//             } else {
//               const rows = {
//                 success: "4",
//                 message:
//                   "Withdraw Request Failed OR Need Minimum " +
//                   minRedeem +
//                   "Points In Your Wallet Your Balance is " +
//                   userBal +
//                   "Earn More",
//               };
//               res.status(200).send(rows);
//               return;
//             }
//           } else {
//             const rows = {
//               success: "3",
//               message: "User Not Exits Or Blocked Please Check Again",
//             };
//             res.status(200).send(rows);
//             return;
//           }
//         } else {
//           const rows = {
//             success: "3",
//             message: "Please Check Again",
//           };
//           res.status(200).send(rows);
//           return;
//         }
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     return;
//   } finally {
//     //mongoose.connection.close();
//
//   }
// };

exports.deduct_withdrawweb = async (req, res) => {
  try {
    const {
      user_id,
      dev_id,
      app_id,
      amount,
      otp,
      message,
      account_number,
      ifsc_code,
    } = req.body;

    if (!account_number || !ifsc_code) {
      return res.status(200).json({
        success: "0",
        message: "Please enter Account number and IFSC code",
      });
    }

    const user = await User.findOne({ user_id, app_id, user_status: 1 });

    if (!user) {
      return res
        .status(200)
        .json({ success: "3", message: "User Not Exists Or Blocked" });
    }

    const appSettings = await appControllerModal.findOne({ app_id });

    if (!appSettings) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid app configuration" });
    }
    const currentDate = moment();
    const currentTime = currentDate.format("HH:mm");
    if (
      !(
        currentTime >= appSettings.withdraw_open_time &&
        currentTime <= appSettings.withdraw_close_time
      )
    ) {
      return res.status(200).json({
        success: "4",
        message: `Withdraw allowed only from ${appSettings.withdraw_open_time} to ${appSettings.withdraw_close_time}`,
      });
    }

    if (appSettings.withdraw_otp === 1) {
      const otpRecord = await TempOTP.findOne({ mobile: user.mob });

      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(200).json({ success: "2", message: "Invalid OTP!" });
      }
    }

    const dailyWithdrawals = await pointTableModal.countDocuments({
      user_id,
      //   tr_status: "Success",
      tr_status: { $in: ["Pending", "Success"] },
      tr_nature: "TRWITH003",
      created_at: { $gte: moment().startOf("day").toDate() },
    });

    if (dailyWithdrawals >= 1) {
      return res
        .status(200)
        .json({ success: "2", message: "Only 1 withdrawals allowed per day!" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid withdrawal amount!" });
    }

    if (user.win_amount < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.win_amount}`,
      });
    }

    if (user.win_amount < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.win_amount}`,
      });
    }

    const updatedBalance = user.win_amount - amount;

    const updateResult = await User.updateOne(
      { user_id, app_id },
      { $set: { win_amount: updatedBalance } }
    );
    const currentDate1 = moment();
    const formattedDate1 = currentDate1.format("DD-MM-YYYY");
    const transaction = new pointTableModal({
      app_id,
      user_id,
      transaction_id: Math.random().toString(36).substr(2, 10),
      tr_nature: "TRWITH003",
      tr_value: amount,
      tr_value_updated: updatedBalance,
      value_update_by: "Withdraw",
      tr_value_type: "Debit",
      tr_remark: `Withdraw By ${user_id}`,
      tr_status: "Pending",
      created_at: new Date(),
      account_no: account_number,
      ifsc_code,
      date: formattedDate1,
    });

    const savedTransaction = await transaction.save();

    return res.status(200).json({
      success: "1",
      message: "Withdraw Request Successfully Created",
      account_no: account_number,
      ifsc_code,
    });
  } catch (error) {
    console.error("Server Error: ", error);
    return res
      .status(500)
      .json({ success: "0", message: "Server Error", error: error.message });
  }
};
exports.deduct_withdrawUpiweb = async (req, res) => {
  try {
    const { user_id, dev_id, app_id, amount, otp, message, upi_id } = req.body;

    if (!upi_id) {
      return res.status(200).json({
        success: "0",
        message: "Please enter UPI ID",
      });
    }

    const user = await User.findOne({ user_id, app_id, user_status: 1 });

    if (!user) {
      return res
        .status(200)
        .json({ success: "3", message: "User Not Exists Or Blocked" });
    }

    const appSettings = await appControllerModal.findOne({ app_id });

    if (!appSettings) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid app configuration" });
    }
    const currentDate = moment();
    const currentTime = currentDate.format("HH:mm");
    if (
      !(
        currentTime >= appSettings.withdraw_open_time &&
        currentTime <= appSettings.withdraw_close_time
      )
    ) {
      return res.status(200).json({
        success: "4",
        message: `Withdraw allowed only from ${appSettings.withdraw_open_time} to ${appSettings.withdraw_close_time}`,
      });
    }

    if (appSettings.withdraw_otp === 1) {
      const otpRecord = await TempOTP.findOne({ mobile: user.mob });

      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(200).json({ success: "2", message: "Invalid OTP!" });
      }
    }

    const dailyWithdrawals = await pointTableModal.countDocuments({
      user_id,
      //   tr_status: "Success",
      tr_status: { $in: ["Pending", "Success"] },
      tr_nature: "TRWITH003",
      created_at: { $gte: moment().startOf("day").toDate() },
    });

    if (dailyWithdrawals >= 1) {
      return res
        .status(200)
        .json({ success: "2", message: "Only 1 withdrawals allowed per day!" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid withdrawal amount!" });
    }

    if (user.credit < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.credit}`,
      });
    }

    if (user.credit < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.credit}`,
      });
    }

    const updatedBalance = user.credit - amount;

    const updateResult = await User.updateOne(
      { user_id, app_id },
      { $set: { credit: updatedBalance } }
    );
    const currentDate1 = moment();
    const formattedDate1 = currentDate1.format("DD-MM-YYYY");
    const transaction = new pointTableModal({
      app_id,
      user_id,
      transaction_id: Math.random().toString(36).substr(2, 10),
      tr_nature: "TRWITH003",
      tr_value: amount,
      tr_value_updated: updatedBalance,
      value_update_by: "Withdraw",
      tr_value_type: "Debit",
      tr_remark: `Withdraw By ${user_id}`,
      tr_status: "Pending",
      created_at: new Date(),
      upi_id: upi_id,
      withdrawType: "upi",
      date: formattedDate1,
    });

    const savedTransaction = await transaction.save();

    return res.status(200).json({
      success: "1",
      message: "Withdraw Request Successfully Created",
    });
  } catch (error) {
    console.error("Server Error: ", error);
    return res
      .status(500)
      .json({ success: "0", message: "Server Error", error: error.message });
  }
};

exports.add_bank_account = async (req, res) => {
  try {
    const result = schemaadd_bank_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      const user1 = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
        user_status: "1",
      });
      if (!req.body.account_number) {
        return res.status(200).json({
          success: "3",
          message: "Please Enter Account Number",
        });
      }
      if (user1) {
        const userTemps = await userTempModal.findOne({
          mob: user1.mob,
          // otp: req.body.otp,
        });
        var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
        if (reqiestid == "Invalid otp") {
          return res.status(200).json({
            success: "3",
            message: "Invalid Otp",
          });
        }
        if (user1.toJSON().FullName) {
          var name = user1.toJSON().FullName;
        } else {
          var name = "NA";
        }
        const add_bank_accountcountAll = await add_bank_account.countDocuments({
          mob: user1.mob,
          account_number: req.body.account_number,
        });
        if (add_bank_accountcountAll > 0) {
          return res.status(200).json({
            success: "3",
            message: "Account Number Already Exist",
          });
        }
        const add_bank_accountcount = await add_bank_account.countDocuments({
          mob: user1.mob,
        });
        if (add_bank_accountcount == 0) {
          var status = "approved";
          var msg = "Bank Account Added Successfully and Approved.";
        } else {
          var status = "pending";
          var msg =
            "Bank Account Added Successfully and Pending, Please Wait 10 Minute for Approval.";
        }
        const deductwith = new add_bank_account({
          // id: ids12,
          mob: user1.toJSON().mob,
          name: name,
          bank_name: req.body.bank_name,
          account_holder: req.body.account_holder,
          account_number: req.body.account_number,
          ifsc_code: req.body.ifsc_code,
          app_id: req.body.app_id,
          user_id: req.body.user_id,
          login_url: "babaclubs.in",
          status: status,
        });
        deductwith.save();

        const rows = {
          success: 1,
          message: msg,
        };
        res.status(200).send(rows);
        return;
      } else {
        const rows = {
          success: "3",
          message: "User Not Exits Or Blocked Please Check Again",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};

exports.get_bank_accountAll = async (req, res) => {
  try {
    const result = schemaadd_all_bank_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      const user1 = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
        user_status: "1",
      });
      if (user1) {
        const data = await add_bank_account
          .find({
            user_id: req.body.user_id,
          })
          .sort({ created_at: -1 });
        const rows = {
          success: 1,
          data: data,
          message: "Successfully",
        };
        res.status(200).send(rows);
        return;
      } else {
        const rows = {
          success: "3",
          message: "User Not Exits Or Blocked Please Check Again",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};

exports.get_bank_accountSuccess = async (req, res) => {
  try {
    const result = schemaadd_success_bank_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      const user1 = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
        user_status: "1",
      });
      if (user1) {
        const data = await add_bank_account.find({
          user_id: req.body.user_id,
          status: "approved",
        });
        const rows = {
          success: 1,
          data: data,
          message: "Successfully",
        };
        res.status(200).send(rows);
        return;
      } else {
        const rows = {
          success: "3",
          message: "User Not Exits Or Blocked Please Check Again",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};