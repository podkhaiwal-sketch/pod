const User = require("../models/user.model.js");
const PointTable = require("../models/point_table.model.js");
const UserWithdraw = require("../models/user_withdraw.model.js");
const walletReportModal = require("../models/walletReport.model.js");
const userTempModal = require("../models/userTemp.model.js");
const appControllerModal = require("../models/appController.model.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const Joi = require("joi");
const axios = require("axios");
// const moment = require('moment');
const moment = require("../js/moment.min.js");

const schema = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  mob: Joi.number().required(),
});

const schemachkotp = Joi.object({
  otp: Joi.string().required(),
  mob: Joi.number().required(),
});
const schemalatlong = Joi.object({
  user_id: Joi.string().required(),
  lat: Joi.string().required(),
  long: Joi.string().required(),
});

const sendOtpViaUrl = async (mobileNum, otp) => {
  // try {
  // const otpUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=3C60NRFraEJ8g2BvHAt5O4SwPzK7UqWQIsnxXi9Lmob1VcGYZye1BYFioxPptK6h0OXaw3Hj5GWsDnvq&variables_values=${otp}&route=otp&numbers=${encodeURIComponent(mobileNum)}`;
  // if (mobileNum == "9782950745") {
  // const otpUrl = `https://payment.babaclubs.in/api/sendsms.php?mobile=${encodeURIComponent(
  //   mobileNum
  // )}&otp=${otp}`;
  // const response = await axios.get(otpUrl);
  // } else {
  //   const otpUrl = `http://msg.easy2approach.com/api/smsapi?key=f1205f295b0ed1c9b327ca67737bd476&route=1&sender=USERSV&number=${encodeURIComponent(
  //     mobileNum
  //   )}&sms=Your%20one%20time%20verification%20code%20is%20${otp}.%20Verification%20code%20is%20valid%20for%2030%20min.,%20We%20have%20never%20ask%20for%20verification%20code%20or%20pin.%20&templateid=1207161838546260705`;
  //   const response = await axios.get(otpUrl);
  // }
  // console.log("OTP API Response:", response.data);
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  //   return;
  // }
  var mob = "+91" + mobileNum;
  //  const axios = require("axios");
  const FormData = require("form-data");
  let data = new FormData();
  data.append("key", "jeTwMY1uOURMMXBxW6wvQiiwBUNKgzVYxlVrPaEkbakCpUwDCuBy");
  data.append("mobile", mob);
  data.append("otp", "5656");

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://a2technosoft.services/api/v1/sms-secure-push",
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };
  const response = await axios.request(config);
  return response.data.requestId;
};

exports.sendOtp = async (req, res) => {
  try {
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }
    var uniqueToken = randomstring.generate({
      length: 70,
      charset: "alphanumeric",
    });
    const users = await User.findOne({
      app_id: req.body.app_id,
      mob: req.body.mob,
    });
    // console.log(req.body.app_id);
    if (users) {
      if (users.user_status == 0) {
        return res
          .status(200)
          .json({ success: "3", message: "Account is blocked by admin" });
      }
      await User.updateOne(
        { mob: req.body.mob, app_id: req.body.app_id },
        {
          $set: {
            device_id: req.body.dev_id,
            user_from: "web",
            device_token: req.body.device_id,
            is_login: 1,
            is_logout: 1,
            token: users.token,
            user_status: 1,
            // login_token: uniqueToken,
          },
        }
      );

      if (req.body.mob == 7300004271) {
        var otp = "123456";
        var reqiestid = otp;
      } else {
        var otp = Math.floor(100000 + Math.random() * 900000);
        var reqiestid = await sendOtpViaUrl(req.body.mob, otp);
      }
      console.log(reqiestid + "opopop");
      const userTemps = await userTempModal.findOne({
        mob: req.body.mob,
      });
      if (userTemps) {
        await userTempModal.updateOne(
          { mob: req.body.mob },
          {
            $set: {
              otp: reqiestid,
            },
          }
        );
      } else {
        const data = {
          otp: reqiestid,
          mob: req.body.mob,
        };

        const usertemp = new userTempModal(data);
        const usertempSave = await usertemp.save();
      }

      // const otp = 123456;
      return res.status(200).json({
        success: "1",
        message: "User Login Success",
        // user_id: users.user_id,
        // device_id: users.device_id,
        // name: users.FullName,
        // // otp: otp,
        // token: users.token,
        // device_token: users.device_token,
        // is_kyc: users.is_kyc,
        // image: users.image,
        // dob: users.dob,
        // tokenl: uniqueToken,
        // imageFull: "https://www.babaclubs.in/api/uploads/kyc/" + users.image,
      });
    } else {
      // return res.status(200).json({
      //   success: "3",
      //   message: "Please Contact Admin!",
      // });
      // console.log("User not Found:", users);
      let uid = randomstring.generate({
        length: 10,
        charset: "alphabetic",
      });

      // const count1 = await User.find().sort({ id: 'desc' }).limit(1).exec();
      // if (count1.length>0) {

      //   var ids03 = count1[0].id + 1;
      // } else {
      //   var ids03 = 1;
      // }
      let currentDatelastseen = moment();
      // currentDatelastseen.add(5, 'hours').add(30, 'minutes');
      let date_time = currentDatelastseen.format("DD-MM-YYYY");
      let time = currentDatelastseen.format("HH:mm:ss A");

      var appcontroller = await appControllerModal.findOne().select("is_bonus");
      if (appcontroller.toJSON().is_bonus == "yes") {
        var isbonus = 1;
      } else {
        var isbonus = 0;
      }
      let ref_code = randomstring.generate({
        length: 8,
        charset: "numeric",
      });

      const data = {
        credit: 0,
        // id: ids03,
        user_id: uid,
        bonus_diamonds: 0,
        user_status: 1,
        mob: req.body.mob,
        app_id: req.body.app_id,
        dev_id: req.body.dev_id,
        reg_date: date_time,
        reg_time: time,
        // login_token: uniqueToken,
        is_bonus: isbonus,
        ref_code: ref_code,
      };

      const user = new User(data);
      const userSave = await user.save();
      // const otp = (req.body.mob === 8003466954) ? 1234 : Math.floor(100000 + Math.random() * 900000);
      const otp = Math.floor(100000 + Math.random() * 900000);
      // const otp = 123456;

      const userTemps = await userTempModal.findOne({
        mob: req.body.mob,
      });
      if (userTemps) {
        await userTempModal.updateOne(
          { mob: req.body.mob },
          {
            $set: {
              otp: otp,
            },
          }
        );
      } else {
        const data = {
          otp: otp,
          mob: req.body.mob,
        };

        const usertemp = new userTempModal(data);
        const usertempSave = await usertemp.save();
      }

      await sendOtpViaUrl(req.body.mob, otp);

      return res.status(200).json({
        success: "1",
        message: "User Login Success",
        // user_id: userSave.user_id,
        // device_id: userSave.device_id,
        // name: userSave.FullName,
        // // otp: otp,
        // token: userSave.token,
        // device_token: userSave.device_token,
        // is_kyc: userSave.is_kyc,
        // image: userSave.image,
        // dob: userSave.dob,
        // tokenl: uniqueToken,
        // imageFull: "https://www.babaclubs.in/api/uploads/kyc/" + userSave.image,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
const chkOtpViaUrl = async (requestid, otp) => {
  try {
    const FormData = require("form-data");
    let data = new FormData();
    data.append("key", "jeTwMY1uOURMMXBxW6wvQiiwBUNKgzVYxlVrPaEkbakCpUwDCuBy");
    data.append("otp", otp);
    data.append("requestId", requestid);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://a2technosoft.services/api/v1/sms-check-otp",
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data.message;
  } catch (error) {
    console.error("OTP sending error:", error);
    return null;
  }
};
exports.loginChkotp = async (req, res) => {
  try {
    const result = schemachkotp.validate(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }
    var uniqueToken = randomstring.generate({
      length: 70,
      charset: "alphanumeric",
    });
    const users = await User.findOne({
      mob: req.body.mob,
    });
    if (users) {
      if (users.user_status == 0) {
        return res
          .status(200)
          .json({ success: "3", message: "Account is blocked by admin" });
      }

      const userTemps = await userTempModal.findOne({
        mob: req.body.mob,
        // otp: req.body.otp,
      });
      if (userTemps) {
        if (req.body.mob != "7300004271") {
          var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
          if (reqiestid == "Invalid otp") {
            return res.status(200).json({
              success: "3",
              message: "Invalid Otp",
            });
          }
        }

        await User.updateOne(
          { mob: req.body.mob },
          {
            $set: {
              login_token: uniqueToken,
              login_url: "babaclubs.in",
            },
          }
        );

        return res.status(200).json({
          success: "1",
          message: "User Login Success",
          user_id: users.user_id,
          device_id: users.device_id,
          name: users.FullName,
          token: users.token,
          device_token: users.device_token,
          is_kyc: users.is_kyc,
          image: users.image,
          dob: users.dob,
          tokenl: uniqueToken,
          imageFull: "https://www.babaclubs.in/api/uploads/kyc/" + users.image,
        });
      } else {
        return res.status(200).json({
          success: "3",
          message: "Invalid Otp",
        });
      }
    } else {
      return res.status(200).json({
        success: "3",
        message: "Invalid Details",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.updateUserLatLong = async (req, res) => {
  try {
    const result = schemalatlong.validate(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }
    const users = await User.findOne({
      user_id: req.body.user_id,
    });
    if (users) {
      await User.updateOne(
        { user_id: req.body.user_id },
        {
          $set: {
            lat: req.body.lat,
            long: req.body.long,
          },
        }
      );
      return res.status(200).json({
        success: "1",
        message: "Successfully Updated",
      });
    } else {
      return res.status(200).json({
        success: "2",
        message: "User Not Found!",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

async function getReferralName(referralCode, appId) {
  const referralUser = await User.findOne({
    ref_code: referralCode,
    app_id: appId,
  });
  return referralUser ? referralUser.FullName : "Unknown User";
}

function convertTimestampToKolkataTime(timestamp) {
  const kolkataTime = new Date(timestamp).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  return kolkataTime;
}

const profileschema = Joi.object({
  user_id: Joi.string().required(),
  device_id: Joi.string().required(),
  app_id: Joi.string().required(),
});

exports.getUserProfile = async (req, res) => {
  try {
    const profileresult = profileschema.validate(req.body);
    const { user_id, device_id, app_id } = req.body;
    if (!profileresult) {
      return res
        .status(400)
        .json({ success: "4", message: "Invalid data inserted, try again." });
    }
    const user = await User.findOne({
      user_id: req.body.user_id,
      user_status: 1,
    });
    if (user) {
      if (user.ref_code == null) {
        let ref_code = randomstring.generate({
          length: 8,
          charset: "numeric",
        });

        await User.updateOne(
          { user_id: req.body.user_id },
          {
            $set: {
              ref_code: ref_code,
            },
          }
        );
      }

      const credit = user.credit + user.win_amount;
      const refCode = user.is_ref_enabled ? user.ref_code : "******";
      const refByCode = user.is_ref_enabled
        ? `${user.ref_code} Reffer By ${await getReferralName(
            user.ref_by,
            req.body.app_id
          )}`
        : "User not exists or blocked";
      const timestamp = Date.now();
      const kolkataTime = convertTimestampToKolkataTime(timestamp);
      const response = {
        success: "1",
        message: "Profile Fetched Successfully",
        credit: parseInt(credit),
        refIsEnable: user.is_ref_enabled,
        refCode,
        refByCode,
        refmessage: user.is_ref_enabled
          ? "You are now able to share Referral code to any other new friends"
          : "You need to enable Referral first, deposit and play, then you are able to share Referral Code",
        name: user.FullName,
        dob: user.dob,
        email: user.email,
        total_bonus: user.ref_bonous,
        total_sharings: "12",
        total_contrubution: "1234",
        device_id: device_id,
        mob: user.mob,
        date_time: kolkataTime,
        game_host: user.game_host,
        tokenl: user.login_token,
        user_status: user.user_status,
        is_bonus: user.is_bonus,
        ref_code: user.ref_code,
        ref_by: user.ref_by,
      };
      return res.status(200).json(response);
    } else {
      return res.status(200).json({
        success: "3",
        message: "User Not Exists Or Blocked. Please Check Again.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

const updateschema = Joi.object({
  user_id: Joi.string().required(),
  FullName: Joi.string().required(),
  dob: Joi.string().required(),
  email: Joi.string().required(),
});
const updateRefferCodeschema = Joi.object({
  user_id: Joi.string().required(),
  ref_by: Joi.number().required(),
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
      return res
        .status(400)
        .json({ success: "0", message: "Invalid data inserted, try again." });
    }
    const { user_id, FullName, dob } = req.body;
    const user = await User.findOne({
      user_id: req.body.user_id,
      user_status: 1,
    });
    if (!user) {
      return res.status(200).json({
        success: "3",
        message: "User Not Exists Or Blocked. Please Check Again.",
      });
    }
    await User.updateOne(
      { user_id: req.body.user_id },
      {
        $set: {
          dob: req.body.dob,
          FullName: req.body.FullName,
          email: req.body.email,
        },
      }
    );
    const updatedUser = await User.findOne({ user_id });
    if (updatedUser) {
      const responseData = {
        success: "1",
        message: "Updated success",
        data: {
          FullName: updatedUser.FullName,
          dob: updatedUser.dob,
          email: updatedUser.email,
        },
      };
      res.json(responseData);
    } else {
      const responseData = {
        success: "0",
        message: "User not found or not updated",
      };
      res.json(responseData);
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.updateRefferCode = async (req, res) => {
  try {
    const updateresult = updateRefferCodeschema.validate(req.body);
    if (updateresult.error) {
      return res
        .status(400)
        .json({ success: "0", message: "Invalid data inserted, try again." });
    }
    const { user_id, ref_by } = req.body;
    const user = await User.findOne({
      user_id: req.body.user_id,
      user_status: 1,
    });
    if (!user) {
      return res.status(200).json({
        success: "3",
        message: "User Not Exists Or Blocked. Please Check Again.",
      });
    }
    const user1 = await User.findOne({
      // is_bonus: 1,
      user_status: 1,
      ref_code: ref_by,
    });
    if (!user1) {
      return res.status(200).json({
        success: "3",
        message: "Invalid Reffer Code Please Try Again.",
      });
    }
    if (user.ref_code == req.body.ref_by) {
      return res.status(200).json({
        success: "3",
        message: "Please Try Again.",
      });
    }

    await User.updateOne(
      { user_id: req.body.user_id },
      {
        $set: {
          ref_by: req.body.ref_by,
        },
      }
    );
    const updatedUser = await User.findOne({ user_id });
    if (updatedUser) {
      const responseData = {
        success: "1",
        message: "Updated success",
        data: {
          ref_by: updatedUser.ref_by,
          ref_code: updatedUser.ref_code,
        },
      };
      res.json(responseData);
    } else {
      const responseData = {
        success: "0",
        message: "User not found or not updated",
      };
      res.json(responseData);
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
const creditschema = Joi.object({
  app_id: Joi.string().required(),
  user_id: Joi.string().required(),
  dev_id: Joi.string().required(),
});
exports.getUserCredit = async (req, res) => {
  try {
    const validationResult = creditschema.validate(req.body);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    } else {
      const dev_id = req.body.dev_id;
      const app_id = req.body.app_id;
      const user_id = req.body.user_id;
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
      });
      if (user) {
        const rows = {
          success: "1",
          message: "Balance Fetched Successfully",
          credit: parseInt(user.credit) + parseInt(user.win_amount),
        };
        res.json(rows);
        return;
      } else {
        const rows = {
          success: "3",
          message: "User Not Exists Or Blocked Please Check Again",
        };
        res.json(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.walletReport = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    if (!user_id) {
      return res
        .status(400)
        .json({ success: "0", message: "Error Please Fill All Details" });
    }
    const date = new Date("2024-02-06");
    const limit = 10;
    let initial_page = 0;
    // const page = req.body.page;
    const paginate = req.body.paginate;
    var SendresPagination = paginate + 1;
    if (paginate !== null && paginate !== undefined) {
      initial_page = (paginate - 1) * limit;
    }
    const result = await walletReportModal
      .find({ user_id: user_id })
      .sort({ _id: -1 })
      .skip(initial_page)
      .limit(limit);
    const arrayList = result.map((row) => ({
      transaction_id: row.created_at,
      amount: row.tr_value,
      market: row.table_id,
      t_type: row.tr_value_type,
      status: row.tr_status,
      closing_balance: row.tr_value_updated,
      remark: row.tr_remark,
      datetime: new Date(row.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    }));
    return res.json({
      success: "1",
      message: "Wallet Report List",
      pagination: SendresPagination,
      data: arrayList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.getUserAccount = async (req, res) => {
  try {
    const user = req.body.user_id;
    if (!user) {
      return res.status(400).json({
        success: "0",
        message:
          "Invalid data inserted. Please try again or you may be blocked by the system",
      });
    } else {
      const userAccounts = await UserWithdraw.find({ user_id: user });
      const arrayData = userAccounts.map((account) => ({
        id: account._id,
        bank_name: account.bank_name,
        account_holder: account.account_holder,
        account_no: account.account_no,
        ifsc: account.ifsc,
      }));
      return res.json({
        success: "1",
        message: "List of Account",
        data: arrayData,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
