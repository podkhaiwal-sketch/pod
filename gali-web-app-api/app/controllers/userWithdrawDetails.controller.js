const UserWithdraw = require("../models/user_withdraw.model.js");
const deduct_withdraw = require("../models/deduct_withraw.model.js");
const { MongoClient } = require('mongodb');
const user_withdrawModal = require("../models/user_withdraw.model.js");


exports.getUserdeduct = async (req, res) => {
  const user_id = req.body.user_id;
  
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const date_time = date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "short",
  });

  if (!user_id) {
   
    return res.json({
      success: '0',
      message: 'Invalid data inserted.',
    });
  }
 
  try {
    const userDeduct = await user_withdrawModal.find({ user_id:user_id});
    if (!userDeduct) {
      return res.json({
        success: '0',
        message: 'Try again, or if you make more mistakes, you will be blocked by the system',
      });
    }
    return res.json({
      success: '1',
      message: 'Details of Account',
      data: userDeduct,
    });
  }catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};