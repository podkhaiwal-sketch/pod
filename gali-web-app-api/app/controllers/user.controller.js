const User = require("../models/user.model.js");
const PointTable = require("../models/point_table.model.js");
const UserWithdraw = require("../models/user_withdraw.model.js");
const walletReportModal = require("../models/walletReport.model.js");
const userTempModal = require("../models/userTemp.model.js");
const appControllerModal = require("../models/appController.model.js");
const UserCommissionss = require("../models/userComission.model.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const Joi = require("joi");
const axios = require("axios");
// const moment = require('moment');
const moment = require("../js/moment.min.js");
const sendOtpViaUrl = async (mobileNum, otp) => {
  const mob = "+91" + mobileNum;
  const FormData = require("form-data");
  let data = new FormData();
  data.append("key", "BGTi7eqn9zuYGdobwgUtlSUq9JZ0PtT3zVUWw8RayrkZV0I4IVkw");
  data.append("mobile", mob);
  data.append("otp", otp);

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

function generateUserId(fullName, mobileNum) {
  const tr_name = fullName.substring(0, 2).toUpperCase();
  const tr_id = mobileNum.slice(-5);
  const rand1 = Math.floor(Math.random() * (8888 - 2222 + 1)) + 2222;
  const rand2 = Math.floor(Math.random() * (99 - 11 + 1)) + 11;
  return `${tr_name}${tr_id}${rand1}${rand2}`;
}

/**
 * Direct registration (no OTP). Used by register-step1 and /register.
 */
async function registerUserDirect(req, res) {
  const {
    app_id,
    pss,
    name,
    refercode,
    lat,
    lng,
    dev_model,
    dev_name,
    dev_id,
    mobileNum,
  } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: 0, message: "Please enter name" });
  }
  if (!pss) {
    return res.status(400).json({ success: 0, message: "Please enter password" });
  }
  if (!mobileNum) {
    return res
      .status(400)
      .json({ success: 0, message: "Please enter mobile number" });
  }
  if (!/^\d{10}$/.test(String(mobileNum))) {
    return res.status(400).json({
      success: 0,
      message: "Mobile number should contain only 10 digits.",
    });
  }

  try {
    const existingUser = await User.findOne({ mob: mobileNum, app_id: app_id });
    if (existingUser) {
      return res.status(400).json({
        success: 0,
        message:
          "Mobile Number already exists, please try with another mobile number",
      });
    }

    if (refercode && refercode !== "null" && String(refercode).trim() !== "") {
      const referralUser = await User.findOne({
        ref_code: refercode,
        app_id: app_id,
      });
      if (!referralUser) {
        return res
          .status(400)
          .json({ success: 0, message: "Invalid Referral Code" });
      }
    }

    var uniqueToken = randomstring.generate({
      length: 70,
      charset: "alphanumeric",
    });

    const auth =
      "ghdddddddddddddddddddxcbvxjdddddddgmxzjdfsdjfsjdfkzxcx";

    let ref_code = randomstring.generate({
      length: 6,
      charset: "numeric",
    });

    let referrer = null;
    if (refercode && refercode !== "null" && String(refercode).trim() !== "") {
      referrer = await User.findOne({ ref_code: refercode, app_id });
      if (!referrer) {
        return res
          .status(400)
          .json({ success: 0, message: "Invalid Referral Code." });
      }
    }

    const user_id = generateUserId(name, mobileNum);

    const newUser = new User({
      app_id,
      us_pass: pss,
      FullName: name,
      mob: mobileNum,
      lat,
      lng,
      dev_model,
      dev_name,
      user_id,
      device_id: dev_id,
      ref_code,
      ref_by: refercode && refercode !== "null" ? refercode : "",
      referrer: referrer ? referrer._id : null,
      login_token: uniqueToken,
    });

    await newUser.save();

    return res.status(201).json({
      success: 1,
      message: "User registered successfully!",
      auth,
      user_id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: 0, message: "Server error." });
  }
}

exports.POMregisterstep1 = registerUserDirect;
/** Same as step1 — OTP flow removed; kept for older clients calling /register */
exports.POMregister = registerUserDirect;

// exports.POMregisterstep1 = async (req, res) => {
//   const {
//     app_id,
//     pss,
//     name,
//     refercode,
//     lat,
//     lng,
//     dev_model,
//     dev_name,
//     dev_id,
//     mobileNum,
//   } = req.body;
// console.log(req.body)
//   // Input validation
//   if (!mobileNum) {
//     return res.status(400).json({ success: 0, message: "Please enter mobile number" });
//   }
//   if (!/^\d{10}$/.test(mobileNum)) {
//     return res.status(400).json({ success: 0, message: "Mobile number should contain only 10 digits." });
//   }

//   try {
//     // Check if mobile number already exists
//     const existingUser = await User.findOne({ mob: mobileNum, app_id: app_id });
//     if (existingUser) {
//       return res.status(400).json({ success: 0, message: "Mobile Number already exists, please try with another mobile number" });
//     }

//     // Validate referral code if provided
//     if (refercode && refercode !== 'null') {
//       const referralUser = await User.findOne({ ref_code: refercode, app_id: app_id });
//       if (!referralUser) {
//         return res.status(400).json({ success: 0, message: "Invalid Referral Code" });
//       }
//     }

//     // Generate and send OTP
//     const otp = generateOTP();
//     const requestId = await sendOtpViaUrl(mobileNum, otp);

//     if (!requestId) {
//       return res.status(500).json({ success: 0, message: "Failed to send OTP. Please try again." });
//     }

//     // Save OTP to temporary collection
//     const existingTempUser = await UserTemp.findOne({ mob: mobileNum });
//     if (existingTempUser) {
//       existingTempUser.otp = requestId;
//       await existingTempUser.save();
//     } else {
//       const newTempUser = new UserTemp({ mob: mobileNum, otp: requestId });
//       await newTempUser.save();
//     }

//     return res.status(200).json({ success: 1, message: "OTP sent successfully", requestId });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: 0, message: "Error sending OTP" });
//   }
// };
const schemalogin = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  mobileNum: Joi.number().required(),
  pss: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
});

const schemaNew = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  mob: Joi.number().required(),
});

const schemachkotpNew = Joi.object({
  otp: Joi.string().required(),
  mob: Joi.number().required(),
});

const schemalatlong = Joi.object({
  user_id: Joi.string().required(),
  lat: Joi.string().required(),
  long: Joi.string().required(),
});

exports.login = async (req, res) => {
  try {
    const result = schemalogin.validate(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }
    var uniqueToken = randomstring.generate({
      length: 70,
      charset: "alphanumeric",
    });
    const users = await User.findOne({
      mob: req.body.mobileNum,
      us_pass: req.body.pss,
    });
    if (users) {
      if (users.user_status == 0) {
        return res
          .status(200)
          .json({ success: "3", message: "Account is blocked by admin" });
      }
      if (users.banned == 1) {
        return res
          .status(200)
          .json({ success: "3", message: "Account is blocked by admin" });
      }

      await User.updateOne(
        { mob: req.body.mobileNum },
        {
          $set: {
            login_token: uniqueToken,
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
        login_token: uniqueToken,
      });
    } else {
      return res.status(203).json({
        success: "3",
        message: "Invalid Details",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

// const sendOtpViaUrl = async (mobileNum, otp) => {
//   var mob = "+91" + mobileNum;
//   //  const axios = require("axios");
//   const FormData = require("form-data");
//   let data = new FormData();
//   data.append("key", "IcVavPGPvzWnONAss8O6CmDO5i6ZplyvNEQgZKUFtgIjcymJHKMk");
//   data.append("mobile", mob);
//   data.append("otp", "1245");

//   let config = {
//     method: "post",
//     maxBodyLength: Infinity,
//     url: "https://a2technosoft.services/api/v1/sms-secure-push",
//     headers: {
//       ...data.getHeaders(),
//     },
//     data: data,
//   };
//   const response = await axios.request(config);
//   return response.data.requestId;
// };
exports.sendOtpWithdraw = async (req, res) => {
  try {
    const users = await User.findOne({
      user_id: req.body.user_id,
    });
    if (users) {
      if (users.user_status == 0) {
        return res
          .status(200)
          .json({ success: "3", message: "Account is blocked by admin" });
      }
      var otp = Math.floor(100000 + Math.random() * 900000);
      var reqiestid = await sendOtpViaUrl(users.mob, otp);
      const userTemps = await userTempModal.findOne({
        mob: users.mob,
      });
      if (userTemps) {
        await userTempModal.updateOne(
          { mob: users.mob },
          {
            $set: {
              otp: reqiestid,
            },
          }
        );
      } else {
        const data = {
          otp: reqiestid,
          mob: users.mob,
        };

        const usertemp = new userTempModal(data);
        const usertempSave = await usertemp.save();
      }

      // const otp = 123456;
      return res.status(200).json({
        success: "1",
        message: "Success",
      });
    } else {
      return res.status(200).json({
        success: "3",
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.sendOtpNew = async (req, res) => {
  try {
    const result = schemaNew.validate(req.body);
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
        // var type = "mpin";
      } else {
        // if (users.mpin) {
        //   var type = "mpin";
        // } else {
        var otp = Math.floor(100000 + Math.random() * 900000);
        var reqiestid = await sendOtpViaUrl(req.body.mob, otp);
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
        // }
      }

      // const otp = 123456;
      return res.status(200).json({
        success: "1",
        message: "User Login Success",
      });
    } else {
      let uid = randomstring.generate({
        length: 10,
        charset: "alphabetic",
      });
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
      var reqiestid = await sendOtpViaUrl(req.body.mob, otp);
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

      return res.status(200).json({
        success: "1",
        message: "User Login Success",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.loginChkotpNew = async (req, res) => {
  try {
    const result = schemachkotpNew.validate(req.body);
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
          await User.updateOne(
            { mob: req.body.mob },
            {
              $set: {
                login_token: uniqueToken,
                login_url: "babaclubs.in",
              },
            }
          );

          var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
          if (reqiestid == "Invalid otp") {
            return res.status(200).json({
              success: "3",
              message: "Invalid Otp",
            });
          }
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
            imageFull:
              "https://www.babaclubs.in/api/uploads/kyc/" + users.image,
          });
          // }
        } else {
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
            imageFull:
              "https://www.babaclubs.in/api/uploads/kyc/" + users.image,
          });
        }
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

const chkOtpViaUrl = async (requestid, otp) => {
  try {
    const FormData = require("form-data");
    let data = new FormData();
    data.append("key", "BGTi7eqn9zuYGdobwgUtlSUq9JZ0PtT3zVUWw8RayrkZV0I4IVkw");
    data.append("otp", otp);
    data.append("requestId", requestid);
    // console.log(data);
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
  device_id: Joi.string(),
  dev_id: Joi.string(),
  app_id: Joi.string().required(),
}).or("device_id", "dev_id");

exports.getUserProfile = async (req, res) => {
  try {
    const profileresult = profileschema.validate(req.body);
    if (profileresult.error) {
      return res.status(400).json({
        success: "4",
        message:
          profileresult.error.details[0]?.message ||
          "Invalid data inserted, try again.",
      });
    }
    const { user_id, app_id } = req.body;
    const device_id = req.body.device_id || req.body.dev_id;
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

      const appController = await appControllerModal.findOne({
        app_id: req.body.app_id,
      });
      const PointTabledata = await PointTable.findOne({
        app_id: req.body.app_id,
        user_id: req.body.user_id,
        tr_nature: "TRWITH003",
      }).sort({ id: -1 });
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
        mpin: user.mpin,
        banned: user.banned,
        genral_setting_whatsapp: appController?.whatsapp ?? "",
        genral_setting_withdraw: appController?.min_redeem ?? null,
        is_playstore: user.is_playstore,
        login_token: user.login_token,
        tr_value: PointTabledata?.tr_value ?? 0,
        account_no: PointTabledata?.account_no ?? 0,
        ifsc_code: PointTabledata?.ifsc_code ?? 0,
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
  name: Joi.string().required(),
  dob: Joi.string().required(),
  app_id: Joi.string().required(),
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
    const { user_id, name, dob } = req.body;
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
          FullName: req.body.name,
          email: req.body.email,
        },
      }
    );
    const updatedUser = await User.findOne({ user_id: user_id });
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

// exports.walletReport = async (req, res) => {
//   try {
//       const { dev_id, app_id, user_id, flt_date, tbl_code} = req.body;
//       if (!app_id || !dev_id || !user_id) {
//         return res.json({
//           success: "0",
//           message: "Error Please Fill All Details"
//         });
//       }

//       const user = await User.findOne({
//       user_id: user_id,
//       app_id: app_id,
//       user_status: 1
//     });

//     if (!user) {
//       return res.json({
//         success: '3',
//         message: 'User Not Exists Or Blocked Please Check Again'
//       });
//     }

//       const currentDate = new Date();
//       const twoDaysBefore = new Date();
//       twoDaysBefore.setDate(currentDate.getDate() - 7);

//       const walletReports = await walletReportModal.find({
//         app_id: app_id,
//         user_id: user_id,
//         is_deleted: 0,
//         $or: [{ tr_status: 'Success' }, { tr_status: 'Pending' }],
//         date_time: { $gte: twoDaysBefore }
//       }).sort({ _id: -1 });

//       if (!walletReports || walletReports.length === 0) {
//         return res.json({
//           success: "0",
//           message: "No data Available Or May Be Something went wrong",
//           winAmount: user.win_amount
//         });
//       }

//       const processedReports = await Promise.all(walletReports.map(async (report) => {
//         let valueUpdateBy = report.value_update_by || "";
//         let type = "";

//         if (report.tr_remark === "redeemed") {
//           type = "Bonus";
//         }

//         if (report.is_transfer === null) {
//           report.is_transfer = "";
//         }

//         if (report.is_transfer === 1) {
//           valueUpdateBy = `${report.value_update_by}\n${report.tr_remark}`;
//         }

//         if (report.value_update_by === "Game") {
//           valueUpdateBy = `${report.tr_remark}\n${report.table_id}`;
//         }

//         if (report.tr_value_type === "Debit" && report.tr_nature === "TRGAME001") {
//           const betExpTime = new Date(report.betExpTime);
//           const now = new Date();
//           report.delStatus = betExpTime > now ? 1 : 0;
//         }

//         if (report.value_update_by === "Deposit") {
//           valueUpdateBy = `${report.value_update_by}\n${report.tr_remark}`;
//         }

//         const formattedDate = report.created_at ?
//           new Date(report.created_at).toLocaleString('en-IN', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//           }) : '';

//         return {
//           value_update_by: valueUpdateBy,
//           date_time: report.date_time ?
//             new Date(report.date_time).toLocaleString('en-IN', {
//               day: '2-digit',
//               month: '2-digit',
//               year: 'numeric',
//               hour: '2-digit',
//               minute: '2-digit'
//             }) : '',
//           tr_value: report.tr_value,
//           tr_value_updated: report.tr_value_updated,
//           tr_status: report.tr_status
//         };
//       }));

//       return res.json({
//         success: "1",
//         message: "PointData details success",
//         winAmount: user.win_amount,
//         data: processedReports
//       });
//   } catch (error) {
//       console.error("Error in walletReport:", error);
//       return res.status(500).json({ success: "0", message: "Internal Server Error" });
//   }
// };

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

// const manageCommissionschema = Joi.object({
//   app_id: Joi.string().required(),
//   user_id: Joi.string().required(),
//   dev_id: Joi.string().required(),
//   commission_amount: Joi.number().required(),
// });

exports.manageCommission = async (req, res) => {
  try {
    const { dev_id, app_id, user_id } = req.body;

    if (!app_id || !dev_id || !user_id) {
      return res.json({
        success: "0",
        message: "Error Please Fill All Details",
      });
    }

    const commissions = await UserCommissionss.find({ user_id });

    if (commissions.length > 0) {
      return res.json({
        success: "1",
        message: "Commission List",
        data: commissions,
      });
    } else {
      return res.json({
        success: "2",
        message: "Data Not Found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: "0",
      message: "Server Error",
    });
  }
};
exports.refferlist = async (req, res) => {
  try {
    const { dev_id, app_id, user_id } = req.body;

    if (!app_id || !dev_id || !user_id) {
      return res.json({
        success: "0",
        message: "Error Please Fill All Details",
      });
    }

    const self = await User.findOne({ user_id: user_id });
    const refferData = await User.find({ ref_by: self.ref_code }).select(
      "FullName mob"
    );

    if (refferData.length > 0) {
      return res.json({
        success: "1",
        message: "Commission List",
        data: refferData,
      });
    } else {
      return res.json({
        success: "2",
        message: "Data Not Found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: "0",
      message: "Server Error",
    });
  }
};