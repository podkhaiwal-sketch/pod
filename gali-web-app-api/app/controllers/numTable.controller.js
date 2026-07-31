const User = require("../models/user.model.js");
const comxMarket = require("../models/comxMarket.model.js");
const appController = require("../models/appController.model.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const moment = require("../js/moment.min.js");
const Joi = require("joi");
const schemaNumtbale = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  user_id: Joi.string().required(),
  market_id: Joi.string().required(),
});

exports.getNumTableList = async (req, res) => {
  try {
    const result = schemaNumtbale.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      const users = await User.findOne({
        app_id: req.body.app_id,
        user_id: req.body.user_id,
        user_status: 1,
      });
      if (users) {
        const Getmarket = await comxMarket.findOne({
          market_id: req.body.market_id,
        });
        if (Getmarket) {
          const appcontroller = await appController.findOne();

          const marketOpenTime = Getmarket.toJSON().market_view_time_open;
          const marketCloseTime = Getmarket.toJSON().market_view_time_close;
          const mini_bet = appcontroller.toJSON().jodi_min;
          const max_bet = appcontroller.toJSON().jodi_max;
          const custom_time = marketCloseTime;
          var MinutesDB = Getmarket.toJSON().minute;
          const row2Minute = Getmarket.toJSON().minute; // Replace this with your value from $row2['minute']
          const new_time = formatDateUpperside(custom_time, row2Minute);
          const timestamp = getCurrentTimestamp();
          const date = formatDate(timestamp);
          const openTimeSec = strtotime(date, marketOpenTime);
          const closeTimeSec = strtotime(date, marketCloseTime);
          const dateTimestamp = strtotimeStep2(date);
          const currentTimeSec = timestamp - dateTimestamp;
          console.log("currentTimeSec", currentTimeSec);
          console.log("openTimeSec", openTimeSec);
          console.log("closeTimeSec", closeTimeSec);
          const remainingTimeSec = closeTimeSec - currentTimeSec;
          const betCloseSec = remainingTimeSec;
        //   const betCloseSec = remainingTimeSec - 60;
          // var betChangeSec = betCloseSec - (MinutesDB * 60);
          var betChangeSec = betCloseSec;
          const marketid = req.body.market_id;
          console.log("remainingTimeSec", remainingTimeSec);
          console.log("betCloseSec", betCloseSec);
          console.log("MinutesDB", MinutesDB);
          if (betChangeSec < 0) {
            betChangeSec = 0;
          }
          if (
            openTimeSec <= currentTimeSec &&
            closeTimeSec > currentTimeSec &&
            betCloseSec > 0
          ) {
            const rows = {
              success: "1",
              message: "Bet available",
              gap_time: new_time,
              remaining_time_in_seconds: remainingTimeSec,
              betpoint_change_time: betChangeSec,
              points: users.toJSON().credit + users.toJSON().win_amount,
              isLimit: Getmarket.toJSON().is_time_limit_applied,
            };
            if (
              betChangeSec <= 0 &&
              Getmarket.toJSON().is_time_limit_applied == 1
            ) {
              rows.mini_bet = "5";
              rows.max_bet = Getmarket.toJSON().lamount;
              rows.h_max_bet = Getmarket.toJSON().h_max_limit;
            } else {
              rows.mini_bet = mini_bet;
              rows.max_bet = max_bet;
              rows.h_max_bet = max_bet;
            }
            res.status(200).send(rows);
          } else if (marketid === "DISAWAR") {
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
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(1, "day")
                  .set({ hour: 3, minute: 30, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              } else {
                // res.status(200).send({ "data": rangeEnd });
                // rangeEnd = moment("today 02:40 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                const currentTime = moment();
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(0, "day")
                  .set({ hour: 3, minute: 30, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              }
              if (rangeEnd !== 0) {
                const betChangeSec = rangeEnd - 30 * 60;
                const rows = {
                  success: "1",
                  message: "Bet available",
                  remaining_time_in_seconds: rangeEnd,
                  betpoint_change_time: betChangeSec,
                  gap_time: new_time,
                  points: users.toJSON().credit + users.toJSON().win_amount,
                  isLimit: Getmarket.toJSON().is_time_limit_applied,
                  h_max_bet: Getmarket.toJSON().h_max_limit,
                  mini_bet: mini_bet,
                  max_bet: max_bet,
                };
                res.status(200).send(rows);
              } else {
                const rows = {
                  success: "0",
                  message: "Bet Closed",
                };
                res.status(200).send(rows);
              }
            } else {
              const rows = {
                success: "0",
                message: "Bet Closed",
              };
              res.status(200).send(rows);
            }
          } else if (marketid === "SHIV ") {
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
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(1, "day")
                  .set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              } else {
                // rangeEnd = moment("today 01:00 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                const currentTime = moment();
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(0, "day")
                  .set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              }
              if (rangeEnd !== 0) {
                const betChangeSec = rangeEnd - 30 * 60;
                const rows = {
                  success: "1",
                  message: "Bet available",
                  remaining_time_in_seconds: rangeEnd,
                  betpoint_change_time: betChangeSec,
                  gap_time: new_time,
                  points: users.toJSON().credit + users.toJSON().win_amount,
                  isLimit: Getmarket.toJSON().is_time_limit_applied,
                  h_max_bet: Getmarket.toJSON().h_max_limit,
                  mini_bet: mini_bet,
                  max_bet: max_bet,
                };
                res.status(200).send(rows);
              } else {
                const rows = {
                  success: "0",
                  message: "Bet Closed",
                };
                res.json(rows);
                return;
              }
            } else {
              const rows = {
                success: "0",
                message: "Bet Closed",
              };
              res.json(rows);
              return;
            }
          } else if (marketid === "MAFIY") {
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
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(1, "day")
                  .set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              } else {
                // rangeEnd = moment("today 02:45 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                const currentTime = moment();
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(0, "day")
                  .set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              }
              if (rangeEnd !== 0) {
                const betChangeSec = rangeEnd - 30 * 60;
                const rows = {
                  success: "1",
                  message: "Bet available",
                  remaining_time_in_seconds: rangeEnd,
                  gap_time: new_time,
                  betpoint_change_time: betChangeSec,
                  points: users.toJSON().credit + users.toJSON().win_amount,
                  isLimit: Getmarket.toJSON().is_time_limit_applied,
                  h_max_bet: Getmarket.toJSON().h_max_limit,
                  mini_bet: mini_bet,
                  max_bet: max_bet,
                };
                res.json(rows);
                return;
              } else {
                const rows = {
                  success: "0",
                  message: "Bet Closed",
                };
                res.json(rows);
                return;
              }
            } else {
              const rows = {
                success: "0",
                message: "Bet Closed",
              };
              res.json(rows);
              return;
            }
          } 
          
          else if (marketid === "KGFTIME") {
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
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(1, "day")
                  .set({ hour: 0, minute: 30, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              } else {
                // rangeEnd = moment("today 02:45 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                const currentTime = moment();
                // Get tomorrow's date at 02:40 AM
                const tomorrowTime = moment()
                  .add(0, "day")
                  .set({ hour: 0, minute: 30, second: 0, millisecond: 0 });
                // Calculate the difference in minutes
                const minuteDifference = tomorrowTime.diff(
                  currentTime,
                  "minutes"
                );
                rangeEnd = minuteDifference * 60 + 60;
              }
              if (rangeEnd !== 0) {
                const betChangeSec = rangeEnd - 30 * 60;
                const rows = {
                  success: "1",
                  message: "Bet available",
                  remaining_time_in_seconds: rangeEnd,
                  gap_time: new_time,
                  betpoint_change_time: betChangeSec,
                  points: users.toJSON().credit + users.toJSON().win_amount,
                  isLimit: Getmarket.toJSON().is_time_limit_applied,
                  h_max_bet: Getmarket.toJSON().h_max_limit,
                  mini_bet: mini_bet,
                  max_bet: max_bet,
                };
                res.json(rows);
                return;
              } else {
                const rows = {
                  success: "0",
                  message: "Bet Closed",
                };
                res.json(rows);
                return;
              }
            } else {
              const rows = {
                success: "0",
                message: "Bet Closed",
              };
              res.json(rows);
              return;
            }
          }

          else {
            const rows = {
              status: "0",
              message: "Bet Closed",
            };
            res.status(200).send(rows);
          }
        } else {
          const rows = {
            status: "0",
            message: "Bet Closed",
          };
          res.status(200).send(rows);
        }
      } else {
        res
          .status(200)
          .send({ status: "0", message: "User Not Available Or Blocked" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
}
function formatDate(timestamp) {
  const dateObj = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };

  return dateObj.toLocaleDateString("en-US", options);
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
function getCurrentTime() {
  const dateObj = new Date();
  const options = { hour: "2-digit", minute: "2-digit", hour12: false };

  return dateObj.toLocaleTimeString("en-US", options);
}
function getCurrentDateTime() {
  const dateObj = new Date();
  const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
  const dateString = dateObj.toLocaleDateString("en-US", dateOptions);
  const timeString = dateObj.toLocaleTimeString("en-US", timeOptions);
  return `${dateString} ${timeString}`;
}
function isWithinTimeRange(ctime, startTime, endTime) {
  const ctimeTimestamp = new Date(`1970-01-01 ${ctime}`).getTime();
  const startTimeTimestamp = new Date(`1970-01-01 ${startTime}`).getTime();
  const endTimeTimestamp = new Date(`1970-01-01 ${endTime}`).getTime();
  return !(
    ctimeTimestamp >= startTimeTimestamp && ctimeTimestamp <= endTimeTimestamp
  );
}
function isWithinTimeRangestep2(ctime, startTime, endTime) {
  const ctimeTimestamp = new Date(`1970-01-01 ${ctime}`).getTime();
  const startTimeTimestamp = new Date(`1970-01-01 ${startTime}`).getTime();
  const endTimeTimestamp = new Date(`1970-01-01 ${endTime}`).getTime();
  return (
    ctimeTimestamp > startTimeTimestamp && ctimeTimestamp <= endTimeTimestamp
  );
}
function getTimestampDifferenceFromTomorrow(ctime) {
  const tomorrowTime = new Date();
  tomorrowTime.setDate(tomorrowTime.getDate() + 1); // Set to tomorrow
  tomorrowTime.setHours(2, 40, 0, 0); // Set the time to 02:40:00
  const ctimeTimestamp = new Date(ctime).getTime();
  return tomorrowTime - ctimeTimestamp;
}
function getTimestampDifferenceFromToday(ctime) {
  const todayTime = new Date().setHours(2, 40, 0, 0); // Set the time to 02:40:00 for today
  const ctimeTimestamp = new Date(ctime).getTime();
  return todayTime - ctimeTimestamp;
}
function getTimestampDifferenceFromTomorrowSecond(ctime) {
  const tomorrowTime = new Date();
  tomorrowTime.setDate(tomorrowTime.getDate() + 1); // Set to tomorrow
  tomorrowTime.setHours(1, 0, 0, 0); // Set the time to 01:00:00
  const ctimeTimestamp = new Date(ctime).getTime();
  return tomorrowTime - ctimeTimestamp;
}
function getTimestampDifferenceFromTodaySecond(ctime) {
  const todayTime = new Date();
  todayTime.setHours(1, 0, 0, 0); // Set the time to 01:00:00
  const ctimeTimestamp = new Date(ctime).getTime();
  return todayTime - ctimeTimestamp;
}
function getTimestampDifferenceFromTomorrowForMafiya(ctime) {
  const tomorrowTime = new Date();
  tomorrowTime.setDate(tomorrowTime.getDate() + 1); // Set to tomorrow
  tomorrowTime.setHours(2, 45, 0, 0); // Set the time to 02:45:00
  const ctimeTimestamp = new Date(ctime).getTime();
  return tomorrowTime - ctimeTimestamp;
}
function getTimestampDifferenceFromTodayForMafiya(ctime) {
  const todayTime = new Date();
  todayTime.setHours(2, 45, 0, 0); // Set the time to 02:45:00
  const ctimeTimestamp = new Date(ctime).getTime();
  return todayTime - ctimeTimestamp;
}
function formatDateUpperside(customTime, minutesSubtract) {
  const customTimeObj = new Date(`1970-01-01 ${customTime}`);
  const resultTimeObj = new Date(
    customTimeObj.getTime() - minutesSubtract * 60000
  ); // Convert minutes to milliseconds
  const options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
  return resultTimeObj.toLocaleTimeString("en-US", options);
}
