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
  date: Joi.string().required(),
  tbl_code: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(10),
});

exports.getPendingBetHistory = async (req, res) => {
  try {
    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
      console.error("Validation Error:", validationResult.error.details[0].message);
      return res.status(400).json({ error: validationResult.error.details[0].message });
    } 
    else
    {
      const { app_id, user_id, page, pageSize } = req.body;
      if (app_id === '' || user_id === '') {
        console.error("Invalid parameters: app_id or user_id is empty");
        const rows = {
          success: "0",
          message: "Error Please Fill All Details"
        };
        res.json(rows);
        return;
      }
      const user = await User.findOne({ user_id, app_id, user_status: 1 });

      if (user) {
       
        const countQuery = gameLoad.countDocuments({ user_id, app_id });
        const totalCount = await countQuery;

        const skip = (page - 1) * pageSize;

        const date = moment(req.body.date);
        // const formattedDate = date.format('DD-MM-YYYY');
        // const dategiven = formattedDate;
        const formattedDate = formatDate(req.body.date);
        //    res.json({'rows':formattedDate});
        // return;
        const marketid = req.body.tbl_code;
        if (marketid == 'all') {
          var resultQuery = gameLoad.find({ user_id, app_id,date:formattedDate }).sort({ id: -1 }).skip(skip).limit(pageSize).lean();
        }else if(req.body.date == 'Invalid date') {
            var resultQuery = gameLoad.find({ user_id, app_id,table_id:marketid }).sort({ id: -1 }).skip(skip).limit(pageSize).lean();
        } else {
            var resultQuery = gameLoad.find({ user_id, app_id,date:formattedDate,table_id:marketid }).sort({ id: -1 }).skip(skip).limit(pageSize).lean();
        }
        const result = await resultQuery;
        if (result.length > 0) {
           const rows = {
              success: "1",
              message: "Home dashboard Fetch Successfully",
              data : [],
              // },
            };
          for (var i = 0; i < result.length; i++) {
            // const givenDate = moment(result[i].is_deleted);
            // const givenDateTime = moment(result[i].date_time, 'YYYY-MM-DD HH:mm:ss');
            // const tenMinutesLater = givenDateTime.add(10, 'minutes').toDate();
            const currentDateTime = moment(result[i].date_time);
            const newDateTime = currentDateTime.add(10, 'minutes');
            const newdatet = newDateTime.format('YYYY-MM-DD HH:mm:ss');
            const currentDateTime122 = moment();
            const currenttime = currentDateTime122.format('YYYY-MM-DD HH:mm:ss');
            const batarray= ["Jodi", "Andar", "Bahar"]
            if (newdatet > currenttime) {
              var isdelete = 1;
            } else {
               var isdelete = 0;
            }
              
                  var marketDetails = {
                      id: result[i].id,
                      marketname: result[i].marketname,
                      bettype: batarray[result[i].game_type-1],
                      date: result[i].date,
                      tr_value: result[i].tr_value,
                      pred_num: result[i].pred_num,
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
        console.error("Invalid parameters for querying the point table");
        return res.status(400).send('Invalid parameters for querying the point table.');
      }
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).send('Internal Server Error');
  }
};
function formatDate(inputDate) {
    const dateParts = inputDate.split('-'); // Assuming inputDate is in the format 'YYYY-MM-DD'
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];

    return `${day}-${month}-${year}`;
}