const User = require("../models/user.model.js");
const comxMarketModel = require("../models/comxMarket.model.js");
const appControllerModal = require("../models/appController.model.js");
const walletReportModal = require("../models/walletReport.model.js");
const gameLoadModal = require("../models/gameLoad.model.js");
// const { gameLoadModal, connect, disconnect } = require("../models/gameLoad.model.js");
const PointTableModel = require("../models/point_table.model.js");

const bonusModal = require("../models/bonus.model.js");
const bonusReportModal = require("../models/bonus_reports.model.js");
const deleted_betModal = require("../models/deleted_bet.model.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
// const moment = require("../js/moment.min.js");
const moment = require("moment-timezone");
const formattedDateTimees = moment()
  .tz("Asia/Kolkata")
  .format("YYYY-MM-DD HH:mm:ss");

const Joi = require("joi");

const schemaPlaceBat = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  user_id: Joi.string().required(),
  market_id: Joi.string().required(),
  BetList: Joi.array().required(),
  dev_model: Joi.string().required(),
  devName: Joi.string().required(),
  batuniqueid: Joi.string().required(),
  // market_name: Joi.string().required(),
  // session: Joi.string().required(),
  // betamount: Joi.number().required(),
  // bettype: Joi.number().required(),
  // btype: Joi.string().required(),
  // token:Joi.string(),
});

exports.bat_place = async (req, res) => {
  try {
    const result = schemaPlaceBat.validate(req.body);

    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      if (req.body.market_id == "DEMO") {
        if (
          ["USTQPJWXBO", "TMJADBZVFK", "cnpLGkHXPz"].includes(req.body.user_id)
        ) {
        } else {
          const rows = {
            success: "0",
            message: "Bet has been closed",
          };
          res.status(200).send(rows);
          return;
        }
      }

      const users = await User.findOne({
        user_id: req.body.user_id,
      }).select(
        "id user_from credit win_amount total_bonus mob game_win h_win"
      );
      if (users) {
        if (users.toJSON().user_from == "app") {
          const rows = {
            success: "3",
            message: "Device changed",
          };
          res.status(200).send(rows);
          return;
        }
        let comxMarket = await comxMarketModel
          .findOne({
            market_id: req.body.market_id,
          })
          .select(
            "market_view_time_open market_view_time_close minute is_time_limit_applied h_max_limit lamount"
          );

        var appcontroller = await appControllerModal
          .findOne()
          .select(
            "jodi_min jodi_max crossingMin crossingMax HarufMin HarufMax ref_comm"
          );

        let timecStatus = 0;

        let tblCode = req.body.market_id;

        console.log("tblCodetblCode", tblCode);

        var cmt = check_time(tblCode, comxMarket, appcontroller, users);

        console.log("cmtcmtcmtcmtcmt", cmt);

        if (cmt == false) {
          const rows = {
            success: "1",
            message: "Bet has been closed",
          };
          res.status(200).send(rows);
          return;
        } else if (cmt == 2) {
          timecStatus = 1;
        }
        var batuniqueid = req.body.batuniqueid;
        
        //       if (tblCode === "DISAWAR" || tblCode === "SHIV" || tblCode === "MAFIY" || tblCode === "KGFTIME") {
        //   let currentTime = moment().tz("Asia/Kolkata");
        //   let ctime = currentTime.format("HH:mm");

        //   let date_time, formattedDateTimees;

        //   if (currentTime.isSameOrBefore(moment("23:59", "HH:mm"))) {
        //     if (currentTime.isSameOrAfter(moment("03:30", "HH:mm"))) {
        //       // Same day
        //       date_time = currentTime.format("YYYY-MM-DD HH:mm:ss");
        //       var date = currentTime.format("DD-MM-YYYY");
        //       formattedDateTimees = date_time;
        //     } else {
        //       // Previous day
        //       let prevDay = currentTime.clone().subtract(1, "day");
        //       date_time = prevDay.format("YYYY-MM-DD HH:mm:ss");
        //       var date = prevDay.format("DD-MM-YYYY");
        //       formattedDateTimees = date_time;
        //     }
        //   } else {
        //     date_time = currentTime.format("YYYY-MM-DD HH:mm:ss");
        //     date = currentTime.format("DD-MM-YYYY");
        //     formattedDateTimees = date_time;
        //   }

        //   console.log({ date_time, date, formattedDateTimees });
        // } else {
        //   let now = moment().tz("Asia/Kolkata");
        //   const date_time = now.format("YYYY-MM-DD HH:mm:ss");
        //   var date = now.format("DD-MM-YYYY");
        //   const formattedDateTimees = date_time;

        //   console.log({ date_time, date, formattedDateTimees });
        // }
        
         if (
          tblCode === "DISAWAR" ||
          tblCode === "SHIV" ||
          tblCode === "MAFIY" ||
          tblCode === "KGFTIME"
        ) {
          let currentTime = moment().tz("Asia/Kolkata");
          let ctime = currentTime.format("HH:mm");

          let  formattedDateTimees;

          if (currentTime.isSameOrBefore(moment("23:59", "HH:mm"))) {
            if (currentTime.isSameOrAfter(moment("03:30", "HH:mm"))) {
              // Same day
              var date_time = currentTime.format("YYYY-MM-DD HH:mm:ss");
              var date = currentTime.format("DD-MM-YYYY");
              formattedDateTimees = date_time;
            } else {
              // Previous day
              let prevDay = currentTime.clone().subtract(1, "day");
              var date_time = prevDay.format("YYYY-MM-DD HH:mm:ss");
              var date = prevDay.format("DD-MM-YYYY");
              formattedDateTimees = date_time;
            }
          } else {
            var date_time = currentTime.format("YYYY-MM-DD HH:mm:ss");
            var date = currentTime.format("DD-MM-YYYY");
            formattedDateTimees = date_time;
          }

          console.log({ date_time, date, formattedDateTimees });
        } else {
          let now = moment().tz("Asia/Kolkata");
          var date_time = now.format("YYYY-MM-DD HH:mm:ss");
          var date = now.format("DD-MM-YYYY");
          const formattedDateTimees = date_time;

          console.log({ date_time, date, formattedDateTimees });
        }
      

        var expTime = new Date(
          new Date().getTime() + 5 * 60 * 1000
        ).toISOString();
        var betTime = new Date().toISOString();
        const usersSecond = await User.findOne({
          user_id: req.body.user_id,
          app_id: req.body.app_id,
          user_status: 1,
        }).select("user_id credit win_amount");

        if (usersSecond) {
          var length = 10;
          var tr_id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          var amount = 0;
          const bets = req.body.BetList;
          for (var i = 0; i < bets.length; i++) {
            amount += parseInt(bets[i]["betamount"]);
          }

          var balance =
            usersSecond.toJSON().credit + usersSecond.toJSON().win_amount;
          var credit = usersSecond.toJSON().credit;
          var win_amount = usersSecond.toJSON().win_amount;
          if (balance < parseInt(amount)) {
            const rows = {
              success: "6",
              message: "You don't Have sufficient Balance",
            };
            res.status(200).send(rows);
            return;
          }
          if (tblCode == "") {
            const rows = {
              success: "0",
              message: "Please select a bazaar to batting.",
            };
            res.status(200).send(rows);
            return;
          } else {
            if (bets.length == 0) {
              const rows = {
                success: "6",
                message: "Please Check Minimum Bat Amount",
              };
              res.status(200).send(rows);
              return;
            }
            for (var i = 0; i < bets.length; i++) {
              if (bets[i]["crossing"] == "yes") {
                if (5 > parseInt(bets[i]["betamount"])) {
                  const rows = {
                    success: "6",
                    message:
                      "Bet value '" +
                      bets[i]["betamount"] +
                      "' is below the minimum bet '" +
                      appcontroller.toJSON().crossingMin +
                      "'. Please check your input.",
                  };
                  res.status(200).send(rows);
                  return;
                }
                if (
                  parseInt(appcontroller.toJSON().crossingMax) <
                  parseInt(bets[i]["betamount"])
                ) {
                  const rows = {
                    success: "6",
                    message:
                      "Bet value '" +
                      bets[i]["betamount"] +
                      "' is below the minimum bet '" +
                      appcontroller.toJSON().crossingMax +
                      "'. Please check your input.",
                  };
                  res.status(200).send(rows);
                  return;
                }
              } else {
                if (parseInt(bets[i]["bettype"]) == 9) {
                  var harafchk = result[0];
                  if (
                    parseInt(appcontroller.toJSON().HarufMin) >
                    parseInt(bets[i]["betamount"])
                  ) {
                    const rows = {
                      success: "6",
                      message:
                        "Bet value '" +
                        bets[i]["betamount"] +
                        "' is below the minimum bet '" +
                        appcontroller.toJSON().HarufMin +
                        "'. Please check your input.",
                    };
                    res.status(200).send(rows);
                    return;
                  }
                  if (
                    parseInt(appcontroller.toJSON().HarufMax) <
                    parseInt(bets[i]["betamount"])
                  ) {
                    const rows = {
                      success: "6",
                      message:
                        "Bet value '" +
                        bets[i]["betamount"] +
                        "' is below the minimum bet '" +
                        appcontroller.toJSON().HarufMax +
                        "'. Please check your input.",
                    };
                    res.status(200).send(rows);
                    return;
                  }
                }
                if (parseInt(bets[i]["bettype"]) == 10) {
                  if (
                    parseInt(appcontroller.toJSON().HarufMin) >
                    parseInt(bets[i]["betamount"])
                  ) {
                    const rows = {
                      success: "6",
                      message:
                        "Bet value '" +
                        bets[i]["betamount"] +
                        "' is below the minimum bet '" +
                        appcontroller.toJSON().HarufMin +
                        "'. Please check your input.",
                    };
                    res.status(200).send(rows);
                    return;
                  }
                  if (
                    parseInt(appcontroller.toJSON().HarufMax) <
                    parseInt(bets[i]["betamount"])
                  ) {
                    const rows = {
                      success: "6",
                      message:
                        "Bet value '" +
                        bets[i]["betamount"] +
                        "' is below the minimum bet '" +
                        appcontroller.toJSON().HarufMax +
                        "'. Please check your input.",
                    };
                    res.status(200).send(rows);
                    return;
                  }
                }
                if (parseInt(bets[i]["bettype"]) == 1) {
                  if (
                    parseInt(appcontroller.toJSON().jodi_min) >
                    parseInt(bets[i]["betamount"])
                  ) {
                    const rows = {
                      success: "6",
                      message:
                        "Bet value '" +
                        bets[i]["betamount"] +
                        "' is below the minimum bet '" +
                        appcontroller.toJSON().jodi_min +
                        "'. Please check your input.",
                    };
                    res.status(200).send(rows);
                    return;
                  }
                  if (
                    parseInt(appcontroller.toJSON().jodi_max) <
                    parseInt(bets[i]["betamount"])
                  ) {
                    const rows = {
                      success: "6",
                      message:
                        "Bet value '" +
                        bets[i]["betamount"] +
                        "' is below the minimum bet '" +
                        appcontroller.toJSON().jodi_max +
                        "'. Please check your input.",
                    };
                    res.status(200).send(rows);
                    return;
                  }
                }
              }
            }
            var cond = 0;
            if (timecStatus == 1) {
              for (var i = 0; i < bets.length; i++) {
                var betamount = bets[i]["betamount"];
                var betkey = bets[i]["betkey"];
                var betType = bets[i]["bettype"];
                const sqlQuery = {
                  table_id: tblCode,
                  user_id: req.body.user_id,
                  pred_num: betkey,
                  betLimitStatus: 1,
                };
                var sdata = 0;

                const result1 = await gameLoadModal.aggregate([
                  {
                    $match: {
                      // Match documents that meet certain conditions
                      table_id: tblCode,
                      user_id: req.body.user_id,
                      pred_num: betkey,
                      betLimitStatus: 1,
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      totalat: { $sum: "$tr_value" }, // Sum 'tr_value' column
                    },
                  },
                ]);
                if (result1.length == 0) {
                  var sdata = 0;
                } else {
                  var sdata = result1[0]["totalat"];
                }

                if (
                  parseInt(sdata) + parseInt(betamount) >
                  parseInt(comxMarket.toJSON().lamount)
                ) {
                  cond = 1;
                  break;
                }
              }
              if (cond == 1) {
                const rows = {
                  success: "6",
                  message:
                    "👉लास्ट टाइम मैं एक जोड़ी आप सिर्फ " +
                    comxMarket.toJSON().lamount +
                    " into खेल सकते हो । 👉अब दूसरी जोड़ियां लगा सकते हो या फिर टाइम से लगाया करो । 🙏धन्यवाद🙏",
                };
                res.status(200).send(rows);
                return;
              }
            }
            const usersFour = await User.findOne({
              user_id: req.body.user_id,
              app_id: req.body.app_id,
              user_status: 1,
            }).select(
              "user_id app_id user_status user_type commission total_played my_played ref_bonous"
            );
            var row_chk_user11 = usersFour;
            if (row_chk_user11) {
              if (
                row_chk_user11.toJSON().user_type == "master" &&
                row_chk_user11.toJSON().commission != 0
              ) {
                var total_played =
                  parseFloat(row_chk_user11.toJSON().total_played) +
                  parseFloat(amount);
                var bonus =
                  parseFloat(row_chk_user11.toJSON().ref_bonous) +
                  (parseFloat(amount) *
                    parseFloat(row_chk_user11.toJSON().commission)) /
                    100;
                var bs =
                  (parseFloat(amount) *
                    parseFloat(row_chk_user11.toJSON().commission)) /
                  100;

                // const count02 = await bonusModal.find().sort({ id: 'desc' }).limit(1).select('id _id').exec();
                // if (count02.length > 0) {
                //   if (count02[0].id == undefined) {
                //     var ids02 = 1;
                //   } else {
                //     var ids02 = count02[0].id + 1;
                //   }
                // } else {
                //   var ids02 = 1;
                // }
                const newBonus111 = new bonusModal({
                  // id: ids02,
                  user_id: req.body.user_id,
                  played: amount,
                  bonus: bs,
                  market_id: tblCode,
                });
                newBonus111.save();
                const currentDate = new Date();
                const Datetodayes = moment(currentDate).format("DD-MM-YYYY");
                const formattedDateTimees = moment()
                  .tz("Asia/Kolkata")
                  .format("YYYY-MM-DD HH:mm:ss");

                const newBonus21 = new bonusReportModal({
                  transaction_id: tr_id,
                  remark: "Credit",
                  win_value: bs,
                  value_update_by: "Game",
                  user_id: req.body.user_id,
                  app_id: req.body.app_id,
                  tr_nature: "TRGAME001",
                  tr_value: amount,
                  tr_value_updated: bonus,
                  date: date,
                  date_time: formattedDateTimees,
                  tr_status: "Success",
                  table_id: tblCode,
                  created_at: formattedDateTimees,
                  tr_remark: "Game Bet",
                });
                newBonus21.save();
                var pre_total_bonus_user =
                  parseFloat(users.toJSON().total_bonus) + bs;
                var total_played1 =
                  parseInt(row_chk_user11.toJSON().my_played) +
                  parseInt(amount);
                await User.updateOne(
                  {
                    user_id: req.body.user_id,
                    app_id: req.body.app_id,
                  },
                  {
                    $set: {
                      total_played: total_played,
                      ref_bonous: bonus.toFixed(2),
                      total_bonus: pre_total_bonus_user.toFixed(2),
                      my_played: total_played1,
                    },
                  }
                );
                // await User.updateOne(
                //   {
                //     user_id: req.body.user_id,
                //     app_id: req.body.app_id
                //   },
                //   {
                //     $set: {
                //       my_played: total_played1
                //     }
                //   }
                // );
              } else {
                var total_played =
                  parseInt(row_chk_user11.toJSON().total_played) +
                  parseInt(amount);
                var bonus =
                  parseInt(row_chk_user11.toJSON().ref_bonous) +
                  (parseInt(amount) *
                    parseInt(appcontroller.toJSON().ref_comm)) /
                    100;
              }
            }
            const formattedDateTimees = moment()
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm:ss");

            var newbalance = parseInt(balance) - parseInt(amount);
            const currentDate = new Date();
            const Datetodayes = moment(currentDate).format("DD-MM-YYYY");

            const count04 = await walletReportModal
              .find()
              .sort({ id: "desc" })
              .limit(1)
              .exec();
            if (count04.length > 0) {
              if (count04[0].id == undefined) {
                var ids04 = 1;
              } else {
                var ids04 = count04[0].id + 1;
              }
            } else {
              var ids04 = 1;
            }
            const newBonus = new walletReportModal({
              id: ids04,
              transaction_id: tr_id,
              game_type: betType,
              type: "Debit",
              value_update_by: "Game",
              app_id: req.body.app_id,
              user_id: req.body.user_id,
              tr_nature: "TRGAME001",
              tr_value: amount,
              tr_value_updated: newbalance,
              date: date,
              date_time: formattedDateTimees,
              tr_status: "Success",
              table_id: tblCode,
              created_at: formattedDateTimees,
              tr_remark: "Game Bet",
              betLimitStatus: timecStatus,
              req_id: req.body.batuniqueid,
              btype: req.body.btype,
            });
            newBonus.save();
            var cbalance = parseInt(credit) - parseInt(amount);
            if (cbalance < 0) {
              var creditdeduct = 0;
              var windeduct = parseInt(amount) - parseInt(credit);
              var win_amount = win_amount - windeduct;
              await User.updateOne(
                {
                  user_id: req.body.user_id,
                  app_id: req.body.app_id,
                },
                {
                  $set: {
                    credit: creditdeduct,
                    win_amount: win_amount,
                  },
                }
              );
            } else {
              await User.updateOne(
                {
                  user_id: req.body.user_id,
                  app_id: req.body.app_id,
                },
                {
                  $set: {
                    credit: cbalance,
                  },
                }
              );
            }

            const newBonusesBat = [];
            for (var i = 0; i < bets.length; i++) {
              var betamount = bets[i].betamount;
              var betkey = bets[i].betkey;
              var betType = bets[i].bettype;
              if (bets[i] != null) {
                var uniquid =
                  Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);
                const currentDate = new Date();
                const Datetodayes = moment(currentDate).format("DD-MM-YYYY");
                // const formattedDateTimees = moment(currentDate).format(
                //   "YYYY-MM-DD HH:mm:ss"
                // );
                const formattedDateTimees = moment()
                  .tz("Asia/Kolkata")
                  .format("YYYY-MM-DD HH:mm:ss");

                // const count05 = await gameLoadModal.find().sort({ id: 'desc' }).limit(1).select('_id id').exec();

                // if (count05.length > 0) {
                //   if (count05[0].id == undefined) {
                //     var ids05 = 1;
                //   } else {
                //     var ids05 = count05[0].id + 1;
                //   }
                // } else {
                //   var ids05 = 1;
                // }

                const usersForWinRate = await User.findOne({
                  user_id: req.body.user_id,
                }).select("user_id app_id game_win h_win");
                if (betType == 1) {
                  var win_rate = usersForWinRate.toJSON().game_win;
                } else {
                  var win_rate = usersForWinRate.toJSON().h_win;
                }

                const newBonus = new gameLoadModal({
                  // id: ids05,
                  user_id: req.body.user_id,
                  uniquid: uniquid,
                  req_id: req.body.batuniqueid,
                  // marketname: req.body.market_name,
                  bettype: req.body.btype,
                  game_type: betType,
                  transaction_id: tr_id,
                  app_id: req.body.app_id,
                  tr_nature: "TRGAME001",
                  tr_value: betamount,
                  date: date,
                  date_time: formattedDateTimees,
                  tr_status: "Success",
                  table_id: tblCode,
                  bet_place_date_time: formattedDateTimees,
                  mobile: users.toJSON().mob,
                  pred_num: betkey,
                  created_at: formattedDateTimees,
                  betLimitStatus: timecStatus,
                  win_rate: win_rate,
                  login_url: "khelogalifaridabad.com",
                });
                newBonusesBat.push(newBonus); // Add each document to the array
              }
            }
            gameLoadModal.insertMany(newBonusesBat);

            const rows = {
              success: "1",
              message: "Game Played Successfully Check in History.",
              credit: newbalance,
              game_name: req.body.market_name,
              total_amount: amount,
              play_date: date,
              date_time: formattedDateTimees,
              txn_id: tr_id,
              BetList: req.body.BetList,
            };

            res.status(200).send(rows);
            return;
          }
        } else {
          const rows = {
            success: "3",
            message: "User Not Exits Or Blocked Please Check Again",
          };
          res.status(200).send(rows);
          return;
        }
      }
      // }
      else {
        res
          .status(200)
          .send({ status: "0", message: "User Not Available Or Blocked" });
        return;
      }
    }
    // await session.commitTransaction();
  } catch (error) {
    // await session.abortTransaction();
    return res.status(500).json({ error: error.message });
  } finally {
    // session.endSession();
    // await disconnect();
    //mongoose.disconnect();
  }
};

function check_time(market_id, comxMarket, appcontroller, users) {
  if (comxMarket) {
    const marketOpenTime = comxMarket.toJSON().market_view_time_open;
    const marketCloseTime = comxMarket.toJSON().market_view_time_close;
    const mini_bet = appcontroller.toJSON().jodi_min;
    const max_bet = appcontroller.toJSON().jodi_max;
    const custom_time = marketCloseTime;
    var MinutesDB = comxMarket.toJSON().minute;
    const row2Minute = comxMarket.toJSON().minute; // Replace this with your value from $row2['minute']
    const new_time = formatDateUpperside(custom_time, row2Minute);
    const timestamp = getCurrentTimestamp();
    const date = formatDate(timestamp);
    const openTimeSec = strtotime(date, marketOpenTime);
    const closeTimeSec = strtotime(date, marketCloseTime);
    const dateTimestamp = strtotimeStep2(date);
    const currentTimeSec = timestamp - dateTimestamp;
    const remainingTimeSec = closeTimeSec - currentTimeSec;
    const betCloseSec = remainingTimeSec;
    // const betCloseSec = remainingTimeSec - 60;
    var betChangeSec = betCloseSec - MinutesDB * 60;
    if (betChangeSec < 0) {
      betChangeSec = 0;
    }
    if (
      openTimeSec <= currentTimeSec &&
      closeTimeSec > currentTimeSec &&
      betCloseSec > 0
    ) {
      const rows = {
        status: "1",
        message: "Bet available",
        gap_time: new_time,
        remaining_time_in_seconds: remainingTimeSec,
        betpoint_change_time: betChangeSec,
        points: users.toJSON().credit + users.toJSON().win_amount,
        isLimit: comxMarket.toJSON().is_time_limit_applied,
      };
      if (betChangeSec > 0 && comxMarket.toJSON().is_time_limit_applied == 1) {
        return 1;
      } else {
        return 2;
      }
    } else if (market_id === "DISAWAR") {
      const ctime = moment().format("HH:mm");
      const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
      if (
        !moment(ctime, "HH:mm").isBetween(
          moment("03:30", "HH:mm"),
          moment("07:00", "HH:mm")
        )
      ) {
        let rangeEnd;
        if (
          moment(ctime, "HH:mm").isBetween(
            moment("07:00", "HH:mm"),
            moment("23:59", "HH:mm")
          )
        ) {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(1, "day")
            .set({ hour: 3, minute: 30, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        } else {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(0, "day")
            .set({ hour: 3, minute: 30, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        }
        if (rangeEnd != 0) {
          const betChangeSec = rangeEnd - 30 * 60;
          const rows = {
            success: "1",
            message: "Bet available",
            remaining_time_in_seconds: rangeEnd,
            betpoint_change_time: betChangeSec,
            gap_time: new_time,
            points: users.toJSON().credit + users.toJSON().win_amount,
            isLimit: comxMarket.toJSON().is_time_limit_applied,
            h_max_bet: comxMarket.toJSON().h_max_limit,
            mini_bet: mini_bet,
            max_bet: max_bet,
          };
          const isLimit = comxMarket.toJSON().is_time_limit_applied;
          if (betChangeSec > 0 && isLimit == 1) {
            return 1;
          } else {
            return 2;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else if (market_id === "SHIV ") {
      const ctime = moment().format("HH:mm");
      const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
      if (
        !moment(ctime, "HH:mm").isBetween(
          moment("01:00", "HH:mm"),
          moment("09:00", "HH:mm")
        )
      ) {
        let rangeEnd;
        if (
          moment(ctime, "HH:mm").isBetween(
            moment("09:00", "HH:mm"),
            moment("23:59", "HH:mm")
          )
        ) {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(1, "day")
            .set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        } else {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(0, "day")
            .set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        }
        if (rangeEnd != 0) {
          const betChangeSec = rangeEnd - 30 * 60;
          const rows = {
            success: "1",
            message: "Bet available",
            remaining_time_in_seconds: rangeEnd,
            betpoint_change_time: betChangeSec,
            gap_time: new_time,
            points: users.toJSON().credit + users.toJSON().win_amount,
            isLimit: comxMarket.toJSON().is_time_limit_applied,
            h_max_bet: comxMarket.toJSON().h_max_limit,
            mini_bet: mini_bet,
            max_bet: max_bet,
          };
          return 2;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else if (market_id === "MAFIY") {
      const ctime = moment().format("HH:mm");
      const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
      if (
        !moment(ctime, "HH:mm").isBetween(
          moment("02:45", "HH:mm"),
          moment("09:00", "HH:mm")
        )
      ) {
        let rangeEnd;
        if (
          moment(ctime, "HH:mm").isBetween(
            moment("09:00", "HH:mm"),
            moment("23:59", "HH:mm")
          )
        ) {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(1, "day")
            .set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        } else {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(0, "day")
            .set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        }
        if (rangeEnd != 0) {
          const betChangeSec = rangeEnd - 30 * 60;
          const rows = {
            success: "1",
            message: "Bet available",
            remaining_time_in_seconds: rangeEnd,
            gap_time: new_time,
            betpoint_change_time: betChangeSec,
            points: users.toJSON().credit + users.toJSON().win_amount,
            isLimit: comxMarket.toJSON().is_time_limit_applied,
            h_max_bet: comxMarket.toJSON().h_max_limit,
            mini_bet: mini_bet,
            max_bet: max_bet,
          };
          return 2;
        } else {
          const rows = {
            success: "0",
            message: "Bet Closed",
          };
          return false;
        }
      } else {
        const rows = {
          success: "0",
          message: "Bet Closed",
        };
        return false;
      }
    } else if (market_id === "KGFTIME") {
      const ctime = moment().format("HH:mm");
      const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
      if (
        !moment(ctime, "HH:mm").isBetween(
          moment("00:30", "HH:mm"),
          moment("07:00", "HH:mm")
        )
      ) {
        let rangeEnd;
        if (
          moment(ctime, "HH:mm").isBetween(
            moment("07:00", "HH:mm"),
            moment("23:59", "HH:mm")
          )
        ) {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(1, "day")
            .set({ hour: 0, minute: 30, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        } else {
          const currentTime = moment();
          const tomorrowTime = moment()
            .add(0, "day")
            .set({ hour: 0, minute: 30, second: 0, millisecond: 0 });
          const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
          rangeEnd = minuteDifference * 60 + 60;
        }
        if (rangeEnd != 0) {
          const betChangeSec = rangeEnd - 30 * 60;
          const rows = {
            success: "1",
            message: "Bet available",
            remaining_time_in_seconds: rangeEnd,
            gap_time: new_time,
            betpoint_change_time: betChangeSec,
            points: users.toJSON().credit + users.toJSON().win_amount,
            isLimit: comxMarket.toJSON().is_time_limit_applied,
            h_max_bet: comxMarket.toJSON().h_max_limit,
            mini_bet: mini_bet,
            max_bet: max_bet,
          };
          return 2;
        } else {
          const rows = {
            success: "0",
            message: "Bet Closed",
          };
          return false;
        }
      } else {
        const rows = {
          success: "0",
          message: "Bet Closed",
        };
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function strtotime(date, marketOpenTime) {
  const dateObj = new Date(date);
  const marketOpenTimeObj = new Date(date + " " + marketOpenTime);

  const differenceInMillis = marketOpenTimeObj - dateObj;
  const differenceInSeconds = differenceInMillis / 1000;

  return differenceInSeconds;
}
function strtotimeStep2(date) {
  const dateObj = new Date(date);
  return Math.floor(dateObj.getTime() / 1000); // Convert milliseconds to seconds
}
function formatDateUpperside(customTime, minutesSubtract) {
  const customTimeObj = new Date(`1970-01-01 ${customTime}`);
  const resultTimeObj = new Date(
    customTimeObj.getTime() - minutesSubtract * 60000
  ); // Convert minutes to milliseconds

  const options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };

  return resultTimeObj.toLocaleTimeString("en-US", options);
}
function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
}
function formatDate(timestamp) {
  const dateObj = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };

  return dateObj.toLocaleDateString("en-US", options);
}
