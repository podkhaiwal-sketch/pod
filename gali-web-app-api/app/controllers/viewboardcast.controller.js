const Broadcast = require("../models/boardcasts.model.js");
const BroadcastSeen = require("../models/broadcastseen.model.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const Joi = require("joi");
const axios = require("axios");
const moment = require("moment");

exports.markBroadcastSeen = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const b_id = req.body.broadcast_id;
    const date = new Date();
    const existingSeenRecord = await BroadcastSeen.findOne({
      b_id: b_id,
      user_id: user_id,
    });
    if (!existingSeenRecord) {
      await BroadcastSeen.create({ b_id: b_id, user_id: user_id });
    }
    const broadcast = await Broadcast.findOne({ _id: b_id });
    if (broadcast) {
      broadcast.seen += 1;
      await broadcast.save();
    }
    return res.json({ success: "1", message: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.getBoardcasts = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const date = new Date();
    const boardcasts = await Broadcast.find().sort({ _id: -1 });
    const arrayList = boardcasts.map((row21) => {
      return {
        title: row21.title,
        message: row21.description,
        id: row21.id,
        link: row21.link,
        date: new Date(row21.created_at).toLocaleString(),
        media: row21.media
          ? `https://chat.babaclubs.in/uploads/broadcast/${row21.media}`
          : "",
        type: row21.type,
      };
    });
    return res.json({ success: "1", message: "List", data: arrayList });
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.getLatestBoardcasts = async (req, res) => {
  try {
    const usrId = req.body.user_id;
    const date = new Date();

    // Find broadcasts seen by the user
    const seenBroadcasts = await BroadcastSeen.find({ user_id: usrId });
    const seenBroadcastIds = seenBroadcasts.map((row) => row.b_id);

    // Find new broadcasts
    let newBroadcasts;
    if (seenBroadcastIds.length > 0) {
      const convertedIds = seenBroadcastIds.map(Number);
      // console.log(convertedIds);
      // console.log(seenBroadcastIds);
      newBroadcasts = await Broadcast.find({ _id: { $nin: seenBroadcastIds } })
        .sort({ _id: -1 })
        .limit(1);
    } else {
      newBroadcasts = await Broadcast.find({}).sort({ _id: -1 }).limit(1);
    }

    if (
      newBroadcasts &&
      Array.isArray(newBroadcasts) &&
      newBroadcasts.length > 0
    ) {
      const broadcastList = newBroadcasts.map((row) => ({
        title: row.title,
        message: row.description,
        id: row.id,
        link: row.link,
        date: new Date(row.created_at).toLocaleString(),
        media: row.media
          ? `https://chat.babaclubs.in/uploads/broadcast/${row.media}`
          : "",
        type: row.type,
        seenIds: seenBroadcastIds,
      }));

      const response = {
        success: "1",
        message: "List",
        data: broadcastList,
        data1: broadcastList,
      };
      res.status(200).json(response);
    } else {
      const response = {
        success: "0",
        message: "No data found",
        data: [],
      };
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  // try {
  //   const usrId = req.body.user_id;
  //   const date = new Date();
  //   const result1 = await BroadcastSeen.find({ user_id: usrId });
  //   const list = result1.map((row) => row.b_id);
  //   var tyu = list;
  //   var result2;
  //   if (list.length > 0) {
  //     var convertedList = list.map(Number);
  //     console.log(convertedList);
  //     console.log(list);
  //     result2 = await Broadcast.find({ id: { $nin: convertedList } })
  //       .sort({ _id: -1 })
  //       .limit(1);
  //   } else {
  //     result2 = await Broadcast.find({}).sort({ _id: -1 }).limit(1);
  //   }
  //   if (result2 !== null && Array.isArray(result2) && result2.length > 0) {
  //     const firstDocument = result2[0];
  //     const arrayList = result2.map((row) => {
  //       return {
  //         title: row.title,
  //         message: row.description,
  //         id: row.id,
  //         link: row.link,
  //         date: new Date(row.created_at).toLocaleString(),
  //         media: row.media
  //           ? `https://www.babajiisatta.com/uploads/kyc/${row.media}`
  //           : "",
  //         type: row.type,
  //         ty: tyu,
  //       };
  //     });
  //     var arrayList1 = [];
  //     const response = {
  //       success: "1",
  //       message: "List",
  //       data: arrayList1,
  //       data1: arrayList,
  //     };
  //     res.status(200).json(response);
  //   } else {
  //     const response = {
  //       success: "0",
  //       message: "No data found",
  //       data: [],
  //     };
  //     res.status(200).json(response);
  //   }
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  //   return;
  // }
};
