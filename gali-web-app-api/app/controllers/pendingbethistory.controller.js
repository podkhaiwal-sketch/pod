const User = require("../models/user.model.js");
const gameLoad = require("../models/gameLoad.model.js");
const mongoose = require('mongoose');
const randomstring = require("randomstring");
const Joi = require('joi');
const axios = require('axios');
const moment = require('moment');


const schema = Joi.object({
  app_id: Joi.string().required(),
  user_id: Joi.string().required(),
  // date: Joi.string().required(),
  tbl_code: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(10),
});
exports.getPendingBetHistory = async (req, res) => {
  try {
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error.details[0].message });
    } else {
      const { app_id, user_id, page, pageSize } = req.body;
      if (app_id === '' || user_id === '') {
        const rows = {
          success: "0",
          message: "Error Please Fill All Details"
        };
        res.json(rows);
        return;
      }
      const user = await User.findOne({ user_id, app_id, user_status: 1 }).select('user_id user_status app_id');

      if (user) {
        const countQuery = gameLoad.countDocuments({ user_id, app_id });
        const totalCount = await countQuery;
         const limit = 10;
        const marketid = req.body.tbl_code;
        const paginate = req.body.page;
        var SendresPagination = paginate + 1;
        if (paginate !== null && paginate !== undefined) {
          initial_page = (paginate - 1) * limit;
        }
        if (marketid == 'all') {
          var resultQuery = gameLoad.find({ user_id, app_id}).sort({ _id: -1 }).skip(initial_page).limit(limit).select('_id user_id app_id marketname bttype tr_value pred_num date_time game_type isdelete bet_place_date_time bettype date table_id');
        }else {
            var resultQuery = gameLoad.find({ user_id, app_id,table_id:marketid }).sort({ _id: -1 }).skip(initial_page).limit(limit).select('_id user_id app_id marketname bttype tr_value pred_num date_time game_type isdelete bet_place_date_time bettype date table_id');
        }
        const result = await resultQuery;
        if (result.length > 0) {
           const rows = {
              success: "1",
              message: "Home dashboard Fetch Successfully",
              pagination:SendresPagination,
              data : [],
            };
          for (var i = 0; i < result.length; i++) {
            const currentDateTime = moment(result[i].bet_place_date_time);
            const newDateTime = currentDateTime.add(5, 'minutes');
            const newdatet = newDateTime.format('YYYY-MM-DD HH:mm:ss');
            const currentDateTime122 = moment();
            const currenttime = currentDateTime122.format('YYYY-MM-DD HH:mm:ss');
            if (newdatet > currenttime) {
              var isdelete = 1;
            } else {
               var isdelete = 0;
            }
              if (result[i].bettype == 'harruf') {
                var bttype = 'Harruf';
              } else {
                var bttype = 'Jodi';
                    }
                  var marketDetails = {
                      id: result[i]._id,
                      marketname: result[i].marketname,
                      bettype: bttype,
                      date: result[i].date,
                      tr_value: result[i].tr_value,
                      pred_num: result[i].pred_num,
                      datetime: result[i].date_time,
                      game_type: result[i].game_type,
                      table_id: result[i].table_id,
                      is_deleted: isdelete,
                    };
              rows.data.push(marketDetails);
          }
            const response = {
              data: rows,
              totalRecords: totalCount,
            };
          return res.send(response);
        } else {
          const rows = {
              success: "0",
              message: "Record Not Found",
              data : [],
          };
            const response = {
              data: rows,
            };
          return res.send(response);
        }
      } else {
        return res.status(400).send('Invalid parameters for querying the point table.');
      }
    }
  }  catch (error) {
   res.status(500).json({ error: error.message });
    return;
  }
};
function formatDate(inputDate) {
    const dateParts = inputDate.split('-'); 
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];
    return `${day}-${month}-${year}`;
}