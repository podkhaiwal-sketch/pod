const User = require("../models/user.model.js");
const PointTable = require("../models/point_table.model.js");
const BonusReport = require("../models/bonus_reports.model.js");
const appController = require("../models/appController.model.js");
const mongoose = require("mongoose");
const randomstring = require("randomstring");
const Joi = require("joi");
const axios = require("axios");
const moment = require("moment");
const schema = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  user_id: Joi.string().required(),
  tbl_code: Joi.string().required(),
  flt_date: Joi.string().required(),
  paginate: Joi.number().required(),
  ispaginate: Joi.string().required(),
});
const schema1 = Joi.object({
  user_id: Joi.string().required(),
});
const schema2 = Joi.object({
  user_id: Joi.string().required(),
  amount: Joi.number().required(),
});

// exports.getBetHistory = async (req, res) => {
//   try {
//     const validationResult = schema.validate(req.body);
//     if (validationResult.error) {
//       return res
//         .status(400)
//         .json({ error: validationResult.error.details[0].message });
//     } else {
//       const dev_id = req.body.dev_id;
//       const app_id = req.body.app_id;
//       const user_id = req.body.user_id;
//       const fltDate1 = req.body.flt_date;
//       const tblCode = req.body.tbl_code;
//       if (app_id === "" || dev_id === "" || user_id === "") {
//         const rows = {
//           success: "0",
//           message: "Error Please Fill All Details",
//         };
//         res.json(rows);
//         return;
//       }
//       const user = await User.findOne({
//         user_id: req.body.user_id,
//         app_id: req.body.app_id,
//         user_status: 1,
//       }).select("user_id app_id user_status");
//       if (user) {
//         let page = 1;
//         if (req.body.paginate) {
//           page = req.body.paginate;
//         }
//         const itemsPerPage = 10;
//         const paginate = req.body.paginate;
//         var SendresPagination = paginate + 1;
//         const offset = (page - 1) * itemsPerPage;
//         if (fltDate1 !== "" && tblCode !== undefined) {
//           if (req.body.ispaginate === "loaduser") {
//             page = 1;
//           } else if (req.body.paginate) {
//             page = req.body.paginate;
//           }

         
//           const formattedDate = req.body.flt_date
//           if (req.body.tbl_code == "all") {
//             var sqlQuery = {
//               app_id: req.body.app_id,
//               user_id: req.body.user_id,
//               date: formattedDate,
//               tr_nature: "TRGAME001",
//             };
//           } else if (req.body.date == "Invalid date") {
//             var sqlQuery = {
//               app_id: req.body.app_id,
//               user_id: req.body.user_id,
//               table_id: req.body.tbl_code,
//               tr_nature: "TRGAME001",
//             };
//           } else {
//             var sqlQuery = {
//               app_id: req.body.app_id,
//               user_id: req.body.user_id,
//               date: formattedDate,
//               tr_nature: "TRGAME001",
//               table_id: req.body.tbl_code,
//             };
//           }

//           const result = await PointTable.find(sqlQuery)
//             .select(
//               "id date_time table_id betExpTime game_type pred_num is_result_declared tr_value win_value value_update_by is_transfer tr_value_type tr_nature date tbl_code"
//             )
//             .sort({ _id: -1 })
//             .skip(offset)
//             .limit(itemsPerPage);

//             console.log("resultddddddd", result);


//           const countQuery = PointTable.countDocuments({
//             tr_nature: "TRGAME001",
//             user_id: req.body.user_id,
//           });
//           const totalCount = await countQuery;
//           const rows = {
//             success: "1",
//             message: "Bat List Fetch Successfully",
//             pagination: SendresPagination,
//             data: result,
//             totalCount: totalCount,
//           };
//           return res.send(rows);
//         } else {
//           return res
//             .status(400)
//             .send("Invalid parameters for querying the point table.");
//         }
//       } else {
//         return res.status(404).send("User not found");
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     return;
//   }
// };



exports.getBetHistory = async (req, res) => {
  try {
    console.log('Request received:', req.body); // Log incoming request
    
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error.details[0].message });
    } else {
      const dev_id = req.body.dev_id;
      const app_id = req.body.app_id;
      const user_id = req.body.user_id;
      const fltDate1 = req.body.flt_date;
      const tblCode = req.body.tbl_code;

      if (app_id === "" || dev_id === "" || user_id === "") {
        const rows = {
          success: "0",
          message: "Error Please Fill All Details",
        };
        res.json(rows);
        return;
      }
      
      const user = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
        user_status: 1,
      }).select("user_id app_id user_status");
      
      if (user) {
        let page = 1;
        if (req.body.paginate) {
          page = req.body.paginate;
        }
        const itemsPerPage = 10;
        const paginate = req.body.paginate;
        var SendresPagination = paginate + 1;
        const offset = (page - 1) * itemsPerPage;

        if (fltDate1 !== "" && tblCode !== undefined) {
          console.log('Date and table code provided');
          
          if (req.body.ispaginate === "loaduser") {
            page = 1;
          } else if (req.body.paginate) {
            page = req.body.paginate;
          }

          const formattedDate = req.body.flt_date;
          console.log('Formatted date:', formattedDate);
          
          let sqlQuery;
          if (req.body.tbl_code == "all") {
            sqlQuery = {
              app_id: req.body.app_id,
              user_id: req.body.user_id,
              date: formattedDate,
              tr_nature: "TRWIN005",
            };
          } else if (req.body.date == "Invalid date") {
            sqlQuery = {
              app_id: req.body.app_id,
              user_id: req.body.user_id,
              table_id: req.body.tbl_code,
              tr_nature: "TRWIN005",
            };
          } else {
            sqlQuery = {
              app_id: req.body.app_id,
              user_id: req.body.user_id,
              date: formattedDate,
              tr_nature: "TRWIN005",
              table_id: req.body.tbl_code,
            };
          }
          
          const result = await PointTable.find(sqlQuery)
            .select("id date_time table_id betExpTime game_type pred_num is_result_declared tr_value win_value value_update_by is_transfer tr_value_type tr_nature date tbl_code")
            .sort({ _id: -1 })
            .skip(offset)
            .limit(itemsPerPage);
            
          const countQuery = PointTable.countDocuments({
            tr_nature: "TRWIN005",
            user_id: req.body.user_id,
          });

          const totalCount = await countQuery;
          const rows = {
            success: "1",
            message: "Bet List Fetch Successfully",
            pagination: SendresPagination,
            data: result,
            totalCount: totalCount,
          };
          return res.send(rows);
        } else {
          return res.status(400).send("Invalid parameters for querying the point table.");
        }
      } else {
        return res.status(404).send("User not found");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};



exports.bonus_report_list = async (req, res) => {
  try {
    const validationResult = schema1.validate(req.body);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    } else {
      const user_id = req.body.user_id;
      if (user_id === "") {
        const rows = {
          success: "0",
          message: "Error Please Fill All Details",
        };
        res.json(rows);
        return;
      }
      const user = await User.findOne({ user_id: req.body.user_id }).select(
        "user_id commission total_played ref_bonous total_bonus"
      );
      if (user) {
        let page = 1;
        if (req.body.paginate) {
          page = req.body.paginate;
        }
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        if (req.body.ispaginate === "loaduser") {
          page = 1;
        } else if (req.body.paginate) {
          page = req.body.paginate;
        }
        var sqlQuery = {
          user_id: req.body.user_id,
          tr_nature: "TRGAME001",
        };
        const result = await BonusReport.aggregate([
          { $match: sqlQuery },
          {
            $group: {
              _id: "$date",
              totalAmount: { $sum: "$tr_value" },
              winAmount: { $sum: "$win_value" },
            },
          },
          { $sort: { _id: -1 } },
          { $skip: offset },
          { $limit: itemsPerPage },
        ]);
        const countQuery = BonusReport.countDocuments({
          user_id: req.body.user_id,
          tr_nature: "TRGAME001",
        });
        const totalCount = await countQuery;
        const comm = await appController.findOne().select("ref_comm");
        const appControllerData = await appController
          .findOne()
          .select("bonus_min bonus_max");
        
        const rows = {
          success: "1",
          message: "Successfully",
          data: result,
          commissionRate: user.toJSON().commission,
          total_played: user.toJSON().total_played,
          total_comm: user.toJSON().ref_bonous,
          total_bonus: user.toJSON().total_bonus,
          bounsmin: appControllerData.toJSON().bonus_min,
          bounsmax: appControllerData.toJSON().bonus_max,
          totalCount: totalCount,
        };
        return res.send(rows);
      } else {
        return res.status(404).send("User not found");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.bonus_report_redem = async (req, res) => {
  try {
    const validationResult = schema2.validate(req.body);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    } else {
      //  if (["TMJADBZVFK", "APlISsZGTl", "BJWRZYDKSX", "EFZANSTXOP", "URYOWQTADS", "TIWUMVHECO"].includes(req.body.user_id)) {

      //   } else {
      //     return;
      //   }
      const user_id = req.body.user_id;
      if (user_id === "") {
        const rows = {
          success: "0",
          message: "Error Please Fill All Details",
        };
        res.json(rows);
        return;
      }
      const user = await User.findOne({ user_id: req.body.user_id });
      if (user) {
        const orderAmount = parseInt(req.body.amount);
        const comm = parseInt(req.body.comm);
        if (orderAmount < user.toJSON().ref_bonous) {
          var payid =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          var order_id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          const currentDate = moment();
          const date = currentDate.format("YYYY-MM-DD");
          const dateFormat = currentDate.format("DD-MM-YYYY");
          const timeFormat = currentDate.format("hh:mm:ss A");
          const dateTimeFormat = `${dateFormat} (${currentDate.format(
            "ddd"
          )}) ${timeFormat}`;
          const appControllerData = await appController.findOne();
          var bounsmin = appControllerData.toJSON().bonus_min;
          var bounsmax = appControllerData.toJSON().bonus_max;
          if (
            orderAmount <= parseInt(user.toJSON().ref_bonous) &&
            orderAmount >= bounsmin &&
            orderAmount <= bounsmax
          ) {
            var newcoins = parseInt(user.toJSON.credit) + parseInt(orderAmount);
            var bonus =
              parseInt(user.toJSON().ref_bonous) - parseInt(orderAmount);
            const newBonus1 = new PointTable({
              user_id: req.body.user_id,
              app_id: "com.babaji.galigame",
              transaction_id: order_id,
              tr_nature: "TRDEPO002",
              tr_value: orderAmount,
              tr_value_updated: bonus,
              value_update_by: "Deposit",
              tr_value_type: "Credit",
              date: date,
              date_time: dateTimeFormat,
              tr_remark: "redeemed",
              tr_status: "Pending",
              is_deleted: "0",
              device_id: "",
              admin_key: "ADMIN0001",
              login_url: "babaclubs.in",
            });
            newBonus1.save();
            const newBonus2 = new BonusReport({
              transaction_id: order_id,
              type: "Debit",
              value_update_by: "Withdraw",
              user_id: req.body.user_id,
              app_id: "com.babaji.galigame",
              tr_nature: "TRGAME003",
              tr_value: orderAmount,
              tr_value_updated: bonus,
              date: date,
              date_time: dateTimeFormat,
              tr_status: "Pending",
              tr_remark: "Bonus Withdraw",
              login_url: "babaclubs.in",
            });
            newBonus2.save();
            await User.updateOne(
              {
                user_id: req.body.user_id,
              },
              {
                $set: {
                  ref_bonous: bonus,
                },
              }
            );
            const rows = {
              success: "1",
              message: "Success",
            };
            res.json(rows);
            return;
          } else {
            const rows = {
              success: "0",
              message:
                "Please Check Minimum" +
                bounsmin +
                " and Maximum " +
                bounsmax +
                " Amount Limit",
            };
            res.json(rows);
            return;
          }
        } else {
          const rows = {
            success: "0",
            message: "Amount is low",
          };
          res.json(rows);
          return;
        }
      } else {
        return res.status(404).send("User not found");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

function formatDate(inputDate) {
  const dateParts = inputDate.split("-");
  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];
  return `${day}-${month}-${year}`;
}
