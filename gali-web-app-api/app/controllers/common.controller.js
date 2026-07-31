const User = require("../models/user.model.js");
const comxMarket = require("../models/comxMarket.model.js");
const appControllerModal = require("../models/appController.model.js");
const appNoticeModel = require("../models/appNotice.model.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const moment = require("../js/moment.min.js");
const momentTz = require("moment-timezone");
const Joi = require("joi");

const schema = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  user_id: Joi.string().required(),
});
const schemaHelp = Joi.object({
  app_id: Joi.string().required(),
});

// API to get help details

const schemaNotice = Joi.object({
  app_id: Joi.string().required(),
  user_id: Joi.string().required(),
});
exports.getHelpDetails = async (req, res) => {
  try {
    const result = schemaHelp.validate(req.body);
    if (result.error) {
      return res.status(400).json({ message: result.error.message });
    }

    const appController = await appControllerModal.findOne({
      app_id: req.body.app_id,
    });

    if (!appController) {
      return res
        .status(200)
        .json({ status: "0", message: "No Available For Play" });
    }

    return res
      .status(200)
      .json({ status: "1", message: "Data found", data: appController });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getHelpDetails = async (req, res) => {
  try {
    // Validate request body
    const { error } = schemaHelp.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: "0", message: error.details[0].message });
    }

    // Fetch help details from the database
    const appController = await appControllerModal.findOne({
      app_id: req.body.app_id,
    });

    if (!appController) {
      return res
        .status(200)
        .json({ status: "0", message: "No Available For Play" });
    }

    return res
      .status(200)
      .json({ status: "1", message: "Data found", data: appController });
  } catch (error) {
    return res.status(500).json({ status: "0", message: error.message });
  }
};
exports.getNoticeDetails = async (req, res) => {
  try {
    const result = schemaNotice.validate(req.body);
    if (result.error) {
      return res.status(400).json({ message: result.error.message });
    }

    const userController = await User.findOne({
      app_id: req.body.app_id,
      user_id: req.body.user_id,
    });

    if (!userController) {
      return res
        .status(200)
        .json({ status: "0", message: "No Available For Play" });
    }

    const appNoticeController = await appNoticeModel.find();

    return res
      .status(200)
      .json({ status: "1", message: "Data found", data: appNoticeController });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const formatTime = (timeString) => {
  if (!timeString) return ""; // Handle empty or undefined values

  const [hours, minutes] = timeString.split(":").map(Number); // Extract hours & minutes
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

// exports.getMarketList = async (req, res) => {
//   try {
//     const result = schema.validate(req.body);
//     if (result.error) {
//       res.status(200).json({ message: result.error.message });
//       return;
//     }

//     const users = await User.findOne({
//       app_id: req.body.app_id,
//       user_id: req.body.user_id,
//     });

//     if (!users) {
//       res.status(200).send({ status: "0", message: "User Not Available Or Blocked" });
//       return;
//     }

//     const Getmarket = await comxMarket.find({
//       app_id: req.body.app_id,
//     }).sort({ market_position: +1 });

//     if (Getmarket.length === 0) {
//       res.status(200).send({ status: "0", message: "No Market Available For Play" });
//       return;
//     }

//     const appController = await appControllerModal.findOne({
//       app_id: req.body.app_id
//     });

//     if (appController.toJSON().market_disable !== '1') {
//       res.status(200).send({ status: "0", message: "Market Disabled" });
//       return;
//     }

//     const rows = {
//       status: "1",
//       message: "Successfully Markets Fetched",
//       data: []
//     };

//     const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
//     const currentDateTime = new Date(currentTimestamp * 1000); // Convert to Date object
//     currentDateTime.setHours(currentDateTime.getHours() + 5); // Adjust for IST (UTC+5:30)
//     currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);

//     Getmarket.forEach((marketData) => {
//       const market = {
//         SUB_NAME: marketData.toJSON().market_sub_name,
//         open_time: formatTime(marketData.toJSON().market_view_time_open),
//         time: formatTime(marketData.toJSON().market_view_time_close),
//         name: marketData.toJSON().market_name,
//         id: marketData.toJSON().market_id,
//         is_play: '0', // Default to closed
//       };

//       const mid = marketData.toJSON().market_id;
//       const mtime = marketData.toJSON().market_view_time_close;

//        // Logic for DISAW market
//        if (mid === 'DISAW') {
//         const startTime = new Date(currentDateTime);
//         startTime.setHours(3, 0, 0); // Start time: 03:00:00
//         const endTime = new Date(currentDateTime);
//         endTime.setHours(7, 0, 0); // End time: 07:00:00

//         if (currentDateTime >= startTime && currentDateTime <= endTime) {
//           market.is_play = '0'; // Market is closed during this time
//         } else {
//           market.is_play = '1'; // Market is open
//         }
//       }
//       // Logic for SHIV market
//       else if (mid === 'SHIV ') {
//         const startDateTime11 = new Date(currentDateTime);
//         startDateTime11.setHours(1, 0, 0); // Start time: 01:00:00
//         const endDateTime11 = new Date(currentDateTime);
//         endDateTime11.setHours(9, 0, 0); // End time: 09:00:00

//         if (currentDateTime >= startDateTime11 && currentDateTime <= endDateTime11) {
//           market.is_play = '0'; // Market is closed during this time
//         } else {
//           market.is_play = '1'; // Market is open
//         }
//       }
//       // Logic for MAFIY market
//       else if (mid === 'MAFIY') {
//         const startTime21 = new Date(currentDateTime);
//         startTime21.setHours(2, 45, 0); // Start time: 02:45:00
//         const endTime21 = new Date(currentDateTime);
//         endTime21.setHours(9, 0, 0); // End time: 09:00:00

//         if (currentDateTime >= startTime21 && currentDateTime <= endTime21) {
//           market.is_play = '0'; // Market is closed during this time
//         } else {
//           market.is_play = '1'; // Market is open
//         }
//       }
//       // Logic for other markets
//       else {
//         const currentTimeFormatted = new Intl.DateTimeFormat('en-US', {
//           hour: '2-digit',
//           minute: '2-digit',
//           second: '2-digit',
//           hour12: false,
//         }).format(currentDateTime);

//         if (currentTimeFormatted < mtime && currentDateTime.getHours() > 6) {
//           market.is_play = '1'; // Market is open
//         } else {
//           market.is_play = '0'; // Market is closed
//         }
//       }

//       rows.data.push(market);
//     });

//     res.status(200).send({ message: rows });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.getMarketList = async (req, res) => {
  try {
   
    const formatTime = (timeString) => {
      if (!timeString) return ""; 
      const [hours, minutes] = timeString.split(":").map(Number); 
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; 
      return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    };
    const result = schema.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const users = await User.findOne({
        app_id: req.body.app_id,
        user_id: req.body.user_id,
      });
     
      if (users) {
        const Getmarket = await comxMarket
          .find({
            app_id: req.body.app_id,
            status:1,
          })
          .sort({ market_position: 1 });
        if (Getmarket.length > 0) {
          const rows = {
            status: "1",
            message: "Successfully Markets Fetched",
            data: [],
          };
          const appController = await appControllerModal.findOne({
            app_id: req.body.app_id,
          });
          const marketDisabled = String(
            appController?.market_disable ?? "1"
          );

          if (marketDisabled === "1") {
            const nowKolkata = momentTz.tz("Asia/Kolkata");
            const istWindowClosed = (startH, startM, endH, endM) => {
              const start = nowKolkata
                .clone()
                .startOf("day")
                .hour(startH)
                .minute(startM)
                .second(0)
                .millisecond(0);
              const end = nowKolkata
                .clone()
                .startOf("day")
                .hour(endH)
                .minute(endM)
                .second(0)
                .millisecond(0);
              return (
                nowKolkata.isSameOrAfter(start) &&
                nowKolkata.isSameOrBefore(end)
              );
            };
            const padHms = (timeStr) => {
              const parts = String(timeStr || "23:59:59")
                .trim()
                .split(":");
              const h = String(parseInt(parts[0], 10) || 0).padStart(2, "0");
              const m = String(parseInt(parts[1], 10) || 0).padStart(2, "0");
              const s =
                parts[2] !== undefined && parts[2] !== ""
                  ? String(parseInt(parts[2], 10) || 0).padStart(2, "0")
                  : "00";
              return `${h}:${m}:${s}`;
            };

            Getmarket.forEach((marketData) => {
              const mJson = marketData.toJSON();
              const market = {
                SUB_NAME: mJson.market_sub_name,
                open_time: formatTime(mJson.market_view_time_open),
                time: formatTime(mJson.market_view_time_close),
                name: mJson.market_name,
                id: mJson.market_id,
                is_play: "",
              };
              const mid = mJson.market_id;
              const mtime = mJson.market_view_time_close;
              const clockStr = nowKolkata.format("HH:mm:ss");

              if (mid === "DISAWAR") {
                market.is_play = istWindowClosed(3, 30, 7, 0) ? "0" : "1";
              } else if (mid === "SHIV ") {
                market.is_play = istWindowClosed(1, 0, 9, 0) ? "0" : "1";
              } else if (mid === "MAFIY") {
                market.is_play = istWindowClosed(2, 45, 9, 0) ? "0" : "1";
              } else if (mid === "KGFTIME") {
                market.is_play = istWindowClosed(0, 30, 7, 0) ? "0" : "1";
              } else {
                const after6am = nowKolkata.hour() > 6;
                const beforeClose = clockStr <= padHms(mtime);
                market.is_play = after6am && beforeClose ? "1" : "0";
              }
              rows.data.push(market);
            });
          }
          res.status(200).send({ message: rows });
          return;
        } else {
          res
            .status(200)
            .send({ status: "0", message: "No Market Available For Play" });
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
