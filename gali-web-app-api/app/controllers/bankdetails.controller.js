const UserWithdraw = require("../models/user_withdraw.model.js");
const deduct_withdraw = require("../models/deduct_withraw.model.js");
const { MongoClient } = require('mongodb');
const user_withdrawModal = require("../models/user_withdraw.model.js");


exports.getUserBankDetails = async (req, res) => {
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
    // const userWithdraw = await UserWithdraw.findOne({ user_id: user_id });
    const userWithdraw = await UserWithdraw.findOne({ user_id: user_id }).select('user_id bank_name account_holder account_no ifsc');

    if (!userWithdraw) {
     
      return res.json({
        success: '0',
        message: 'Try again, or if you make more mistakes, you will be blocked by the system',
      });
    }

    const result = {
      user_id: userWithdraw.user_id,
      bank_name: userWithdraw.bank_name,
      account_holder: userWithdraw.account_holder,
      account_no: userWithdraw.account_no,
      ifsc: userWithdraw.ifsc,
    };
    return res.json({
      success: '1',
      message: 'Details of Account',
      data: result,
    });
  }catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};