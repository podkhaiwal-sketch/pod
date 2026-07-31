const User = require("../models/user.model.js");
const mongoose = require('mongoose');
const randomstring = require("randomstring");
const Joi = require('joi');
const axios = require('axios');
const moment = require('moment');
const updateschema = Joi.object({
  user_id: Joi.string().required(),
  FullName: Joi.string().required(),
  dob: Joi.string().required(), 
});
const timestamp = moment().unix();
const dateTime = moment.unix(timestamp).format("DD-MM-YYYY (ddd) hh:mm:ss A");
const date = moment.unix(timestamp).format("DD-MM-YYYY");
const currentDate = moment().format("DD-MM-YYYY");
const currentTime = moment().format("hh:mm");
const currentTimeSecond = moment().format("hh:mm:ss");
const currentTimeSecond24Hours = moment().format("HH:mm:ss");
const timeAMPM = moment().format("A");


exports.updateUserProfile = async (req, res) => {
  try {
    const updateresult = updateschema.validate(req.body); 
    if (updateresult.error) {
      return res.status(400).json({ success: '0', message: 'Invalid data inserted, try again.' });
    }
    const { user_id, FullName, dob } = req.body;
	  const user = await User.findOne({ user_id: req.body.user_id, user_status: 1 });
    if (!user) {
      return res.status(200).json({ success: '3', message: 'User Not Exists Or Blocked. Please Check Again.' });
    }
    await User.updateOne({ user_id:req.body.user_id }, { $set: { dob: req.body.dob, FullName: req.body.FullName } });
    const updatedUser = await User.findOne({ user_id });
    if (updatedUser) {
      const responseData = {
        success: '1',
        message: 'Updated success',
        data: {
          FullName: updatedUser.FullName,
          dob: updatedUser.dob,
        },
      };
      res.json(responseData);
    } else {
      const responseData = {
        success: '0',
        message: 'User not found or not updated',
      };
      res.json(responseData);
    }
  }  catch (error) {
   res.status(500).json({ error: error.message });
    return;
  }
};

