const User = require("../models/user.model.js");
const comxMarketModel = require("../models/comxMarket.model.js");
const appControllerModal = require("../models/appController.model.js");
const walletReportModal = require("../models/walletReport.model.js");
const gameLoadModal = require("../models/gameLoad.model.js");
const bonusModal = require("../models/bonus.model.js");
const bonusReportModal = require("../models/bonus_reports.model.js");
const deleted_betModal = require("../models/deleted_bet.model.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const moment = require("../js/moment.min.js");
const Joi = require("joi");

//const db = require('../config/db.config.js');
const db = mongoose.connection;

const schemaDeleteBat = Joi.object({
  app_id: Joi.string().required(),
  bet_id: Joi.string().required(),
  user_id: Joi.string().required(),
});
exports.bat_delete = async (req, res) => {
  try {
    const result = schemaDeleteBat.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      //  console.log(bet_id);
      const gameLoad = await gameLoadModal
        .findOne({
          user_id: req.body.user_id,
          _id: req.body.bet_id,
        })
        .select(
          "user_id id _id table_id bet_place_date_time tr_value transaction_id pred_num"
        );
      // console.log(gameLoad);
      if (gameLoad) {
        const comxMarket = await comxMarketModel
          .findOne({
            market_id: gameLoad.toJSON().table_id,
          })
          .select(
            "market_view_time_open market_view_time_close minute is_time_limit_applied h_max_limit lamount"
          );
        const appcontroller = await appControllerModal.findOne();
        var chk = check_time(
          gameLoad.toJSON().table_id,
          comxMarket,
          appcontroller
        );
        if (chk == false) {
          const rows = {
            success: "3",
            message: "Market has been has been closed",
          };
          res.status(200).send(rows);
          return;
        }
        if (gameLoad) {
          const currentDate = moment();
          const currentdate = currentDate.format("DD-MM-YYYY");
          const date2 = currentDate.format("DD-MM-YYYY HH:mm:ss");
          var timestamp2 = strtotime(date2);
          const currentDateTime = moment(gameLoad.toJSON().bet_place_date_time);
          const newDateTime = currentDateTime.add(5, "minutes");
          const newdatet = newDateTime.format("YYYY-MM-DD HH:mm:ss");
          const currentDateTime122 = moment();
          const currenttime = currentDateTime122.format("YYYY-MM-DD HH:mm:ss");
          if (newdatet > currenttime) {
            var amount = gameLoad.toJSON().tr_value;
            const user = await User.findOne({
              user_id: req.body.user_id,
            });
            if (user) {
              const currentDate = moment();
              const data12 = currentDate.format("DD-MM-YYYY");
              const date11 = currentDate.format("DD-MM-YYYY HH:mm:ss");
              var userid = req.body.user_id;
              var referenceId = gameLoad.toJSON().transaction_id;
              var table_id = gameLoad.toJSON().table_id;
              var pred_num = gameLoad.toJSON().pred_num;
              if (
                user.toJSON().user_type == "master" &&
                user.toJSON().commission != 0
              ) {
                var orderamount = (amount * user.toJSON().commission) / 100;
                var updatedAmount =
                  user.toJSON().ref_bonous -
                  (amount * user.toJSON().commission) / 100;
                await User.updateOne(
                  {
                    user_id: userid,
                  },
                  {
                    $set: {
                      ref_bonous: updatedAmount.toFixed(2),
                    },
                  }
                );
                //  const count06 = await bonusReportModal.find().sort({ id: 'desc' }).limit(1).exec();
                //   if (count06.length>0) {
                //     if(count06[0].id == undefined){
                //       var ids06 = 1;
                //     }else{
                //       var ids06 = count06[0].id + 1;
                //     }
                //   } else {
                //     var ids06 = 1;
                //   }
                const bonusReportModals = new bonusReportModal({
                  // id:ids06,
                  transaction_id: referenceId,
                  type: "Debit",
                  value_update_by: "Game",
                  user_id: userid,
                  app_id: "com.babaji.galigame",
                  tr_nature: "TRGAME003",
                  table_id: table_id,
                  tr_value: orderamount.toFixed(2),
                  tr_value_updated: updatedAmount.toFixed(2),
                  date: data12,
                  date_time: date11,
                  tr_status: "Success",
                  tr_remark: "Game Deleted",
                  remark: "Debit",
                });
                bonusReportModals.save();
              }

              var updatedAmount11 = user.toJSON().credit + amount;
              var updatedAmount1 =
                user.toJSON().credit + user.toJSON().win_amount + amount;
              await User.updateOne(
                {
                  user_id: userid,
                },
                {
                  $set: {
                    credit: updatedAmount11,
                  },
                }
              );
              //  const count07 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
              //     if (count07.length>0) {
              //       if(count07[0].id == undefined){
              //         var ids07 = 1;
              //       }else{
              //       var ids07 = count07[0].id + 1;
              //       }
              //     } else {
              //       var ids07 = 1;
              //     }
              const walletReportModals = new walletReportModal({
                // id:ids07,
                type: "Credit",
                pred_num: pred_num,
                table_id: table_id,
                transaction_id: referenceId,
                value_update_by: "Deposit",
                user_id: userid,
                app_id: "com.babaji.galigame",
                tr_nature: "TRREF006",
                tr_value: amount,
                tr_value_updated: updatedAmount1,
                date: data12,
                date_time: date11,
                tr_status: "Success",
                tr_remark: "Game Deleted",
              });
              walletReportModals.save();
              const gameLoadNewInser = await gameLoadModal.findOne({
                _id: req.body.bet_id,
              });
              const walletReportModalsw = new deleted_betModal({
                id: gameLoadNewInser.toJSON().id,
                uniquid: gameLoadNewInser.toJSON().uniquid,
                app_id: gameLoadNewInser.toJSON().app_id,
                user_id: gameLoadNewInser.toJSON().user_id,
                tr_nature: gameLoadNewInser.toJSON().tr_nature,
                bettype: gameLoadNewInser.toJSON().bettype,
                marketname: gameLoadNewInser.toJSON().marketname,
                win_value: gameLoadNewInser.toJSON().win_value,
                tr_value: gameLoadNewInser.toJSON().tr_value,
                date: gameLoadNewInser.toJSON().date,
                date_time: gameLoadNewInser.toJSON().date_time,
                tr_status: gameLoadNewInser.toJSON().tr_status,
                table_id: gameLoadNewInser.toJSON().table_id,
                transaction_id: gameLoadNewInser.toJSON().transaction_id,
                is_win: gameLoadNewInser.toJSON().is_win,
                is_result_declared:
                  gameLoadNewInser.toJSON().is_result_declared,
                pred_num: gameLoadNewInser.toJSON().pred_num,
                betLimitStatus: gameLoadNewInser.toJSON().betLimitStatus,
                is_deleted: gameLoadNewInser.toJSON().is_deleted,
                created_at: gameLoadNewInser.toJSON().created_at,
                updated_at: gameLoadNewInser.toJSON().updated_at,
                deleted_by: "user",
              });
              walletReportModalsw.save();
              await gameLoadModal.deleteMany({
                _id: req.body.bet_id,
              });

              const rows = {
                success: "1",
                message: "Delete Successfully",
              };
              res.status(200).json(rows);
              return;
            } else {
              const rows = {
                success: "0",
                message: "User not available",
              };
              res.status(200).json(rows);
              return;
            }
          } else {
            const rows = {
              success: "0",
              message: "Bet will be delete after 10 minutes of bet placed",
            };
            res.status(200).json(rows);
            return;
          }
        } else {
          const rows = {
            success: "0",
            message: "Bet Closed",
          };
          res.status(200).json(rows);
          return;
        }
      } else {
        const rows = {
          success: "0",
          message: "Bet Not Found",
        };
        res.status(200).json(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  function check_time(market_id, comxMarket, appcontroller) {
    if (comxMarket) {
      const marketOpenTime = comxMarket.toJSON().market_view_time_open;
      const marketCloseTime = comxMarket.toJSON().market_view_time_close;
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
      const betCloseSec = remainingTimeSec - 60;
      var betChangeSec = betCloseSec - MinutesDB * 60;
      if (betChangeSec < 0) {
        betChangeSec = 0;
      }
      if (
        openTimeSec <= currentTimeSec &&
        closeTimeSec > currentTimeSec &&
        betCloseSec > 0
      ) {
        return true;
      } else if (market_id === "DISAW") {
        const ctime = moment().format("HH:mm");
        const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
        if (
          !moment(ctime, "HH:mm").isBetween(
            moment("02:40", "HH:mm"),
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
              .set({ hour: 2, minute: 40, second: 0, millisecond: 0 });
            const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
            rangeEnd = minuteDifference * 60 + 60;
          } else {
            const currentTime = moment();
            const tomorrowTime = moment()
              .add(0, "day")
              .set({ hour: 2, minute: 40, second: 0, millisecond: 0 });
            const minuteDifference = tomorrowTime.diff(currentTime, "minutes");
            rangeEnd = minuteDifference * 60 + 60;
          }
          if (rangeEnd != 0) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else if (market_id === "SHIV") {
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
            return true;
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
            return true;
          } else {
            return false;
          }
        } else {
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
};
