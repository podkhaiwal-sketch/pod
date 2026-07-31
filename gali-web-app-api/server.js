const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const mongoose = require("mongoose");
const dbconnection = require("./app/config/db.config.js");

var jwt = require("jsonwebtoken");
var AWS = require("aws-sdk");
const chatMasterModal = require("./app/models/chatMaster.model.js");
const chatModal = require("./app/models/chat.model.js");
const boardcastsModal = require("./app/models/boardcasts.model.js");
AWS.config.setPromisesDependency(require("bluebird"));
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-west-2",
});

const http = require("https").Server(app);
const io = require("socket.io")(http);

//mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
dbconnection().then(() => {
  console.log("connect1");
});
// Get the default connection
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post("/chat-store", upload.single("file"), (req, res) => {
    const { user_id, message, type, department, sendertype } = req.body;
    if (!user_id || !type) {
      res.json({
        success: "0",
        message: "Invalid data inserted try again",
      });
      return;
    } else {
      if (req.file) {
        const filename = req.file.originalname;

        const tempname = req.file.path;
        const newfilename =
          moment().format("DDMMYYYYHHmmss") + filename.replace(/\s/g, "");
        const folder = `uploads/${newfilename}`;

        fs.rename(tempname, folder, (err) => {
          if (!err) {
            const fileExtension = path.extname(newfilename).toLowerCase();
            let chatype;
            if (
              [
                ".mp4",
                ".webm",
                ".gif",
                ".mkv",
                ".gifv",
                ".m4v",
                ".amv",
              ].includes(fileExtension)
            ) {
              chatype = "video";
            } else if (
              [".pdf", ".xlsx", ".xls", ".ods", ".txt"].includes(fileExtension)
            ) {
              chatype = "document";
            } else {
              chatype = "image";
            }
            const video = newfilename;

            async function getUserDeduct(userId, chatype, video, message) {
              try {
                // Find user records based on user_id
                const userDeduct = await chatMasterModal.find({
                  user_id: userId,
                });
                if (userDeduct.length == 0) {
                  const count01 = await chatMasterModal
                    .find()
                    .sort({ id: "desc" })
                    .limit(1)
                    .exec();
                  if (count01.length > 0) {
                    var ids01 = count01[0].id + 1;
                  } else {
                    var ids01 = 1;
                  }
                  const newBonus1 = new chatMasterModal({
                    id: ids01,
                    user_id: userId,
                    deposit: 0,
                    withdraw: 0,
                  });
                  newBonus1.save();
                }
                const count02 = await chatModal
                  .find()
                  .sort({ id: "desc" })
                  .limit(1)
                  .exec();
                if (count02.length > 0) {
                  var ids02 = count02[0].id + 1;
                } else {
                  var ids02 = 1;
                }
                const newBonus1 = new chatModal({
                  id: ids02,
                  chatType: chatype,
                  image: video,
                  userid: userId,
                  type: sendertype,
                  message: message,
                  department: department,
                });
                newBonus1.save();
                return userDeduct;
              } catch (error) {
                // console.error('Error fetching user deduct:', error);
                throw error; // Propagate the error to the caller
              }
            }

            const Databasereport1 = getUserDeduct(
              user_id,
              chatype,
              video,
              message,
              department
            );
          } else {
            // console.log('else');
            res.json({
              success: "0",
              message: "File upload failed",
            });
          }
        });
      } else {
        async function getUserDeductSecond(userId, message, department) {
          try {
            // Find user records based on user_id
            const userDeduct = await chatMasterModal.find({ user_id: userId });
            // console.log('userDeduct');
            // console.log(userDeduct.length);
            if (userDeduct.length == 0) {
              //  const count01 = await chatMasterModal.find().sort({ id: 'desc' }).limit(1).exec();
              //   if (count01.length > 0) {
              //     var ids01 = count01[0].id + 1;
              //   } else {
              //     var ids01 = 1;
              //   }
              const newBonus1 = new chatMasterModal({
                // id:ids01,
                user_id: userId,
                deposit: 0,
                withdraw: 0,
              });
              newBonus1.save();
            }
            const count02 = await chatModal
              .find()
              .sort({ id: "desc" })
              .limit(1)
              .exec();
            if (count02.length > 0) {
              var ids02 = count02[0].id + 1;
            } else {
              var ids02 = 1;
            }
            const newBonus1 = new chatModal({
              id: ids02,
              chatType: "text",
              userid: userId,
              type: sendertype,
              message: message,
              department: department,
            });
            newBonus1.save();
            return userDeduct;
          } catch (error) {
            // console.error('Error fetching user deduct:', error);
            throw error; // Propagate the error to the caller
          }
        }

        const Databasereport1 = getUserDeductSecond(
          user_id,
          message,
          department
        );
        //  console.log('sddddddddddd');
        // res.json({
        //   success: '1',
        //   message: 'Stored Successfully'
        // });
      }

      async function getUserDeductThird(userId, message, chatype) {
        try {
          // Find user records based on user_id
          const userDeduct = await chatMasterModal.findOne({ user_id: userId });
          // console.log(userDeduct.toJSON()._id);
          // console.log(department);
          if (userDeduct.toJSON()._id) {
            if (department == "deposit") {
              var message = message + " " + chatype + "";
              if (userDeduct.toJSON().deposit == 0) {
                console.log(userDeduct);
                await chatMasterModal.updateOne(
                  {
                    _id: userDeduct.toJSON()._id,
                  },
                  {
                    $set: {
                      deposit: "1",
                      subadmin_id: "0",
                      subadmin_name: "",
                      message: message,
                      status: 0,
                    },
                  }
                );
              } else {
                await chatMasterModal.updateOne(
                  {
                    _id: userDeduct.toJSON()._id,
                  },
                  {
                    $set: {
                      status: 0,
                      subadmin_id: "0",
                      subadmin_name: "",
                      message: message,
                    },
                  }
                );
              }
            }
            if (department == "withdraw") {
              var message = message + " " + chatype + "";
              if (userDeduct.toJSON().withdraw == 0) {
                // console.log(userDeduct.toJSON()._id);
                await chatMasterModal.updateOne(
                  {
                    _id: userDeduct.toJSON()._id,
                  },
                  {
                    $set: {
                      withdraw: "1",
                      withdraw_seen_status: 0,
                      subadmin_id: "0",
                      subadmin_name: "",
                      withdraw_message: message,
                    },
                  }
                );
              } else {
                await chatMasterModal.updateOne(
                  {
                    _id: userDeduct.toJSON()._id,
                  },
                  {
                    $set: {
                      status: 0,
                      subadmin_id: "0",
                      subadmin_name: "",
                      message: message,
                    },
                  }
                );
              }
            }
          }
        } catch (error) {
          // console.error('Error fetching user deduct:', error);
          throw error; // Propagate the error to the caller
        }
      }
      // console.log(chatype);
      if (req.file) {
        const filename = req.file.originalname;

        const tempname = req.file.path;
        const newfilename =
          moment().format("DDMMYYYYHHmmss") + filename.replace(/\s/g, "");
        const folder = `uploads/${newfilename}`;

        // console.log('tempname');
        fs.rename(tempname, folder, (err) => {
          // console.log('folder');
          if (!err) {
            const fileExtension = path.extname(newfilename).toLowerCase();
            let chatype;
            if (
              [
                ".mp4",
                ".webm",
                ".gif",
                ".mkv",
                ".gifv",
                ".m4v",
                ".amv",
              ].includes(fileExtension)
            ) {
              chatype = "video";
            } else if (
              [".pdf", ".xlsx", ".xls", ".ods", ".txt"].includes(fileExtension)
            ) {
              chatype = "document";
            } else {
              chatype = "image";
            }
            const video = newfilename;
            setTimeout(function () {
              const Databasereport1 = getUserDeductThird(
                user_id,
                message,
                chatype
              );
            }, 500);
          }
        });
        res.json({ success: "1", message: "Operation completed" });
      } else {
        // console.log('opop');
        setTimeout(function () {
          const Databasereport1 = getUserDeductThird(user_id, message, "text");
        }, 500);
        res.json({ success: "1", message: "Operation completed" });
      }
    }
  });
  app.post("/chat-store-audio", upload.single("file"), (req, res) => {
    const { user_id, message, type, department, sendertype } = req.body;
    if (!user_id || !type) {
      res.json({
        success: "0",
        message: "Invalid data inserted try again",
      });
      return;
    } else {
      if (req.file) {
        const filename = req.file.originalname;

        const tempname = req.file.path;
        const newfilename =
          moment().format("DDMMYYYYHHmmss") +
          filename.replace(/\s/g, "") +
          ".mp3";
        const folder = `uploads/${newfilename}`;

        fs.rename(tempname, folder, (err) => {
          if (!err) {
            const fileExtension = path.extname(newfilename).toLowerCase();
            let chatype = "audio";
            // if (['.mp4', '.webm', '.gif', '.mkv', '.gifv', '.m4v', '.amv'].includes(fileExtension)) {
            //  chatype = "video";
            // } else if (['.pdf', '.xlsx', '.xls', '.ods', '.txt'].includes(fileExtension)) {
            //  chatype = "document";
            // } else {
            //  chatype = "image";
            // }
            const video = newfilename;

            async function getUserDeduct(userId, chatype, video, message) {
              try {
                // Find user records based on user_id
                const userDeduct = await chatMasterModal.find({
                  user_id: userId,
                });
                if (userDeduct.length == 0) {
                  const count01 = await chatMasterModal
                    .find()
                    .sort({ id: "desc" })
                    .limit(1)
                    .exec();
                  if (count01.length > 0) {
                    var ids01 = count01[0].id + 1;
                  } else {
                    var ids01 = 1;
                  }
                  const newBonus1 = new chatMasterModal({
                    id: ids01,
                    user_id: userId,
                    deposit: 0,
                    withdraw: 0,
                  });
                  newBonus1.save();
                }
                const count02 = await chatModal
                  .find()
                  .sort({ id: "desc" })
                  .limit(1)
                  .exec();
                if (count02.length > 0) {
                  var ids02 = count02[0].id + 1;
                } else {
                  var ids02 = 1;
                }
                const newBonus1 = new chatModal({
                  id: ids02,
                  chatType: chatype,
                  image: video,
                  userid: userId,
                  type: sendertype,
                  message: message,
                  department: department,
                });
                newBonus1.save();
                return userDeduct;
              } catch (error) {
                console.error("Error fetching user deduct:", error);
                throw error; // Propagate the error to the caller
              }
            }

            const Databasereport1 = getUserDeduct(
              user_id,
              chatype,
              video,
              message,
              department
            );
          } else {
            // console.log('else');
            res.json({
              success: "0",
              message: "File upload failed",
            });
          }
        });
      } else {
        async function getUserDeductSecond(userId, message) {
          try {
            // Find user records based on user_id
            const userDeduct = await chatMasterModal.find({ user_id: userId });
            if (userDeduct.length == 0) {
              const count01 = await chatMasterModal
                .find()
                .sort({ id: "desc" })
                .limit(1)
                .exec();
              if (count01.length > 0) {
                var ids01 = count01[0].id + 1;
              } else {
                var ids01 = 1;
              }
              const newBonus1 = new chatMasterModal({
                id: ids01,
                user_id: userId,
                deposit: 0,
                withdraw: 0,
              });
              newBonus1.save();
            }
            const count02 = await chatModal
              .find()
              .sort({ id: "desc" })
              .limit(1)
              .exec();
            if (count02.length > 0) {
              var ids02 = count02[0].id + 1;
            } else {
              var ids02 = 1;
            }
            const newBonus1 = new chatModal({
              id: ids02,
              chatType: "text",
              userid: userId,
              type: sendertype,
              message: message,
              department: department,
            });
            newBonus1.save();
            return userDeduct;
          } catch (error) {
            // console.error('Error fetching user deduct:', error);
            throw error; // Propagate the error to the caller
          }
        }

        const Databasereport1 = getUserDeductSecond(
          user_id,
          message,
          department
        );
        res.json({
          success: "1",
          message: "Stored Successfully",
        });
      }
      async function getUserDeductThird(userId, message, chatype) {
        try {
          // Find user records based on user_id
          const userDeduct = await chatMasterModal.findOne({ user_id: userId });
          if (userDeduct.toJSON().id) {
            if (department == "deposit") {
              var message = message + " " + chatype + "";
              if (userDeduct.toJSON().deposit == 0) {
                await chatMasterModal.updateOne(
                  {
                    id: userDeduct.toJSON().id,
                  },
                  {
                    $set: {
                      deposit: "1",
                      subadmin_id: "0",
                      subadmin_name: "",
                      message: message,
                    },
                  }
                );
              } else {
                await chatMasterModal.updateOne(
                  {
                    id: userDeduct.toJSON().id,
                  },
                  {
                    $set: {
                      status: 0,
                      subadmin_id: "0",
                      subadmin_name: "",
                      message: message,
                    },
                  }
                );
              }
            }
            if (department == "withdraw") {
              var message = message + " " + chatype + "";
              if (userDeduct.toJSON().withdraw == 0) {
                await chatMasterModal.updateOne(
                  {
                    id: userDeduct.toJSON().id,
                  },
                  {
                    $set: {
                      withdrawwithdraw_seen_status: "0",
                      subadmin_id: "0",
                      subadmin_name: "",
                      withdraw_message: message,
                    },
                  }
                );
              } else {
                await chatMasterModal.updateOne(
                  {
                    id: userDeduct.toJSON().id,
                  },
                  {
                    $set: {
                      status: 0,
                      subadmin_id: "0",
                      subadmin_name: "",
                      message: message,
                    },
                  }
                );
              }
            }
          }
        } catch (error) {
          // console.error('Error fetching user deduct:', error);
          throw error; // Propagate the error to the caller
        }
      }
      // console.log(chatype);
      if (req.file) {
        const filename = req.file.originalname;

        const tempname = req.file.path;
        const newfilename =
          moment().format("DDMMYYYYHHmmss") +
          filename.replace(/\s/g, "") +
          ".mp3";
        const folder = `uploads/${newfilename}`;

        fs.rename(tempname, folder, (err) => {
          if (!err) {
            const fileExtension = path.extname(newfilename).toLowerCase();
            let chatype = "audio";
            // if (['.mp4', '.webm', '.gif', '.mkv', '.gifv', '.m4v', '.amv'].includes(fileExtension)) {
            //  chatype = "video";
            // } else if (['.pdf', '.xlsx', '.xls', '.ods', '.txt'].includes(fileExtension)) {
            //  chatype = "document";
            // } else {
            //  chatype = "image";
            // }
            const video = newfilename;

            const Databasereport1 = getUserDeductThird(
              user_id,
              message,
              chatype
            );
          }
        });
      }

      res.json({ success: "1", message: "Operation completed" });
    }
  });

  app.post("/broadcast-store", upload.single("file"), (req, res) => {
    if (req.file) {
      const filename = req.file.originalname;
      const tempname = req.file.path;
      const newfilename =
        moment().format("DDMMYYYYHHmmss") + filename.replace(/\s/g, "");
      const folder = `uploads/broadcast/${newfilename}`;

      fs.rename(tempname, folder, (err) => {
        if (!err) {
          const fileExtension = path.extname(newfilename).toLowerCase();
          let chatype = "audio";
          const video = newfilename;
          var title = req.body.title;
          var link = req.body.link;
          var message = req.body.message;
          var type = req.body.type;

          const newBonus1 = new boardcastsModal({
            title: title,
            link: link,
            message: message,
            type: type,
            media: video,
          });
          newBonus1.save();
        }
        res.json({
          success: "1",
          message: "File upload success",
        });
      });
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
  });

  app.use(cors());

  const corsOptions = {
    origin: "*",
  };

  app.use(cors(corsOptions));

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));
  // var bodyParser = require('body-parser');
  var methodOverride = require("method-override");
  // app.use(bodyParser.urlencoded({
  //   extended: true, limit: '50mb'
  // }));
  // app.use(bodyParser.json({ limit: '50mb' }));
  app.use(methodOverride());

  /*
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  dbconnection().then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
  */

  // set port, listen for requests
  const PORT = process.env.PORT || 30000;
  require("./app/routes/user.routes.js")(app);
  //require("./app/routes/company.routes.js")(app);
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}).on("disconnected", () => {
  console.log("MongoDB connection disconnected");
});