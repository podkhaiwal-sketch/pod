const User = require("../models/user.model.js");
const comxMarketModel = require("../models/comxMarket.model.js");
const appControllerModal = require("../models/appController.model.js");
const walletReportModal = require("../models/walletReport.model.js");
const gameLoadModal = require("../models/gameLoad.model.js");
const bonusModal = require("../models/bonus.model.js");
const bonusReportModal = require("../models/bonus_reports.model.js");
const deleted_betModal = require("../models/deleted_bet.model.js");
const mongoose = require('mongoose');
var randomstring = require("randomstring");
const moment = require("../js/moment.min.js");
const Joi = require('joi');
const schemaPlaceBat = Joi.object({
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  user_id: Joi.string().required(),  
  market_id: Joi.string().required(),
  BetList: Joi.array().required(),
  dev_model: Joi.string().required(),
  devName: Joi.string().required(),
  batuniqueid: Joi.string().required(),
  market_name: Joi.string().required(),
  session: Joi.string().required(),
  betamount: Joi.number().required(),
  bettype: Joi.number().required(),
  btype: Joi.string().required(),
  token:Joi.string().required(),
});
const schemaDeleteBat = Joi.object({
  app_id: Joi.string().required(),
  bet_id: Joi.number().required(),
  user_id: Joi.string().required(),
});
exports.bat_place = async (req, res) => {
  try {

      const result = schemaPlaceBat.validate(req.body);
      if (result.error) {
         res.status(200).json({ message: result.error.message });
      } else {
       
        const users = await User.findOne({
          user_id: req.body.user_id
        });
        if(users)
        {
          if (users.toJSON().user_from == "app") {
               const rows = {
                    success: "3",
                    message: "Device changed"
                };
              res.status(200).send(rows);
              return;
          }
           let comxMarket = await  comxMarketModel.findOne({
          market_id: req.body.market_id,
           });
          var appcontroller = await appControllerModal.findOne();
          
          let timecStatus = 0;
          function check_time(market_id, comxMarket, appcontroller) {
            if (comxMarket) {
                 
            // const appcontroller = await appController.findOne();
            
            const marketOpenTime = comxMarket.toJSON().market_view_time_open;
            const marketCloseTime = comxMarket.toJSON().market_view_time_close;
            const mini_bet = appcontroller.toJSON().jodi_min;
            const max_bet = appcontroller.toJSON().jodi_max;
            const custom_time = marketCloseTime;
            var MinutesDB = comxMarket.toJSON().minute;
            // const resultTime = moment(custom_time, 'YYYY-MM-DD HH:mm:ss').subtract(MinutesDB, 'minutes');

            // const new_time = resultTime.format('H:i:s');

            const row2Minute = comxMarket.toJSON().minute; // Replace this with your value from $row2['minute']

            const new_time = formatDateUpperside(custom_time, row2Minute);
            
            

            const timestamp = getCurrentTimestamp();
            const date = formatDate(timestamp);
            
            const openTimeSec = strtotime(date, marketOpenTime);
            const closeTimeSec = strtotime(date, marketCloseTime);
            
            const dateTimestamp = strtotimeStep2(date);
            
            const currentTimeSec = timestamp - dateTimestamp;
            const remainingTimeSec = closeTimeSec - currentTimeSec;
            const betCloseSec = remainingTimeSec - 60;
            var betChangeSec = betCloseSec - (MinutesDB * 60);
              if(betChangeSec<0){
                betChangeSec=0;
              }
              // res.status(200).send({"openTimeSec":openTimeSec,"currentTimeSec":currentTimeSec,"closeTimeSec":closeTimeSec,"currentTimeSec":currentTimeSec,"betCloseSec":betCloseSec});
              if (openTimeSec <= currentTimeSec && closeTimeSec > currentTimeSec && betCloseSec > 0) {
              // res.status(200).send({"openTimeSec":"openTimeSec"});
              const rows = {
                status: "1",
                message: "Bet available",
                gap_time: new_time,
                remaining_time_in_seconds: remainingTimeSec,
                betpoint_change_time: betChangeSec,
                points: users.toJSON().credit + users.toJSON().win_amount,
                isLimit: comxMarket.toJSON().is_time_limit_applied,
                
              };
               
              if (betChangeSec <= 0 && comxMarket.toJSON().is_time_limit_applied == 1) {
                rows.mini_bet = '5';
                rows.max_bet = comxMarket.toJSON().lamount;
                rows.h_max_bet = comxMarket.toJSON().h_max_limit;
              } else {
                rows.mini_bet = mini_bet;
                rows.max_bet = max_bet;
                rows.h_max_bet = max_bet;
              }
              
            } else if (market_id === 'DISAW') {
                const ctime = moment().format("HH:mm");
                const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
                if (!(moment(ctime, "HH:mm").isBetween(moment("02:40", "HH:mm"), moment("09:00", "HH:mm")))) {
                    let rangeEnd;
                  if (moment(ctime, "HH:mm").isBetween(moment("09:00", "HH:mm"), moment("23:59", "HH:mm"))) {
                    const currentTime = moment();
                  // Get tomorrow's date at 02:40 AM
                  const tomorrowTime = moment().add(1, 'day').set({ hour: 2, minute: 40, second: 0, millisecond: 0 });
                  // Calculate the difference in minutes
                  const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                  rangeEnd = (minuteDifference*60)+60;
                  } else {
                      // res.status(200).send({ "data": rangeEnd });
                    // rangeEnd = moment("today 02:40 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                       const currentTime = moment();
                      // Get tomorrow's date at 02:40 AM
                      const tomorrowTime = moment().add(0, 'day').set({ hour: 2, minute: 40, second: 0, millisecond: 0 });
                      // Calculate the difference in minutes
                      const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                      rangeEnd = (minuteDifference*60)+60;
                    }
                
                    if (rangeEnd != 0) {
                        const betChangeSec = rangeEnd - (30 * 60);
                        const rows = {
                            success: "1",
                            message: "Bet available",
                            remaining_time_in_seconds: rangeEnd,
                            betpoint_change_time: betChangeSec,
                            gap_time: new_time,
                            points: users.toJSON().credit + users.toJSON().win_amount,
                            isLimit: comxMarket.toJSON().is_time_limit_applied,
                            h_max_bet: comxMarket.toJSON().h_max_limit,
                            mini_bet: mini_bet,
                            max_bet: max_bet
                        };
                      const isLimit = comxMarket.toJSON().is_time_limit_applied;
                          if (betChangeSec > 0 && isLimit == 1) {
                            return 1;
                          } else {
                            return 2;
                          }
                    } else {
                      return false;
                    }
                } else {
                    return false;
                }
            } else if (market_id === 'SHIV ') {
                const ctime = moment().format("HH:mm");
                const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
                if (!(moment(ctime, "HH:mm").isBetween(moment("01:00", "HH:mm"), moment("09:00", "HH:mm")))) {
                    let rangeEnd;
                    if (moment(ctime, "HH:mm").isBetween(moment("09:00", "HH:mm"), moment("23:59", "HH:mm"))) {
                       const currentTime = moment();
                        // Get tomorrow's date at 02:40 AM
                        const tomorrowTime = moment().add(1, 'day').set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
                        // Calculate the difference in minutes
                        const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                        rangeEnd = (minuteDifference*60)+60;
                    } else {
                      // rangeEnd = moment("today 01:00 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                       const currentTime = moment();
                        // Get tomorrow's date at 02:40 AM
                        const tomorrowTime = moment().add(0, 'day').set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
                        // Calculate the difference in minutes
                        const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                        rangeEnd = (minuteDifference*60)+60;
                    }
                    if (rangeEnd != 0) {
                        const betChangeSec = rangeEnd - (30 * 60);
                        const rows = {
                            success: "1",
                            message: "Bet available",
                            remaining_time_in_seconds: rangeEnd,
                            betpoint_change_time: betChangeSec,
                            gap_time: new_time,
                            points: users.toJSON().credit + users.toJSON().win_amount,
                            isLimit: comxMarket.toJSON().is_time_limit_applied,
                            h_max_bet: comxMarket.toJSON().h_max_limit,
                            mini_bet: mini_bet,
                            max_bet: max_bet
                        };
                      return 2;
                    } else {
                        return false;
                    }
                } else {
                  return false;
                }
            }  else if (market_id === 'MAFIY') {
                const ctime = moment().format("HH:mm");
                const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
                if (!(moment(ctime, "HH:mm").isBetween(moment("02:45", "HH:mm"), moment("09:00", "HH:mm")))) {
                    let rangeEnd;
                    if (moment(ctime, "HH:mm").isBetween(moment("09:00", "HH:mm"), moment("23:59", "HH:mm"))) {
                        const currentTime = moment();
                        // Get tomorrow's date at 02:40 AM
                        const tomorrowTime = moment().add(1, 'day').set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
                        // Calculate the difference in minutes
                        const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                        rangeEnd = (minuteDifference*60)+60;
                    } else {
                      // rangeEnd = moment("today 02:45 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                      const currentTime = moment();
                        // Get tomorrow's date at 02:40 AM
                        const tomorrowTime = moment().add(0, 'day').set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
                        // Calculate the difference in minutes
                        const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                        rangeEnd = (minuteDifference*60)+60;
                    }
                    if (rangeEnd != 0) {
                        const betChangeSec = rangeEnd - (30 * 60);
                        const rows = {
                            success: "1",
                            message: "Bet available",
                            remaining_time_in_seconds: rangeEnd,
                            gap_time: new_time,
                            betpoint_change_time: betChangeSec,
                            points: users.toJSON().credit + users.toJSON().win_amount,
                            isLimit: comxMarket.toJSON().is_time_limit_applied,
                            h_max_bet: comxMarket.toJSON().h_max_limit,
                            mini_bet: mini_bet,
                            max_bet: max_bet
                        };
                        
                        return 2;
                    } else {
                        const rows = {
                            success: "0",
                            message: "Bet Closed"
                        };
                      return false;
                    }
                } else {
                    const rows = {
                        success: "0",
                        message: "Bet Closed"
                    };
                   return false;
                }
            }else {

              return false;

            }
            } else {
              return false;
            }
          };
         
          let tblCode = req.body.market_id;
          var cmt = check_time(tblCode,comxMarket,appcontroller);
              // res.status(200).send(cmt);
          if (cmt == false) {
             const rows = {
                success: "1",
                message: "Bet has been closed",
              };
          res.status(200).send(rows);
          return;
          } else if (cmt == 2) {
            timecStatus = 1;
          }
          var batuniqueid = req.body.batuniqueid;
          var walletReport = await walletReportModal.findOne({
            req_id:batuniqueid
          });
          //  res.status(200).send({walletReport});
          if (walletReport != null && walletReport.toJSON().id != "") {
            const rows = {
              success: "3",
              message: "Bet has been closed",
            };
            res.status(200).send(rows);
            return;
            
          } else {
            
            if (tblCode == "DISAW" || tblCode == "SHIV " || tblCode == "MAFIY") {
                 var ctime = new Date().toLocaleTimeString();
                if (new Date(ctime) <= new Date('23:59')) {
                    if (new Date(ctime) >= new Date("02:45")) {
                        date_time = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString();
                        date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    } else {
                        date_time = new Date().toISOString();
                        date = new Date().toISOString().split('T')[0];
                    }
                } else {
                    date_time = new Date().toISOString();
                    date = new Date().toISOString().split('T')[0];
                }
            }
           
            var expTime = new Date(new Date().getTime() + 5 * 60 * 1000).toISOString();
            var betTime = new Date().toISOString();

             const usersSecond = await User.findOne({
               user_id: req.body.user_id,
               app_id: req.body.app_id,
               user_status: 1,
             });
             
            if (usersSecond) {
              var length = 10;
              var tr_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

              var amount = 0;
              const bets = req.body.BetList;
              for (var i = 0; i < bets.length; i++) {
                  amount += parseInt(bets[i]['betamount']);
              }
              //  amount = amount.reduce((a, b) => a + b, 0);
               const usersThird = await User.findOne({
               user_id: req.body.user_id,
               app_id: req.body.app_id,
               });
              
               var balance = usersThird.toJSON().credit+usersThird.toJSON().win_amount;
               var credit = usersThird.toJSON().credit;
              var win_amount = usersThird.toJSON().win_amount;
              // for (var i = 0; i < bets.length; i++) {
                //       i++;
                //       var betType = bets[i]['bettype'];
                //   }
                  //  res.status(200).send({"balance":balance,"amount":amount,"usersThird":usersThird,'count':bets.length});
               if (balance < parseInt(amount)) {
                  const rows = {
                    success: "6",
                    message: "You don't Have sufficient Balance",
                  };
                 res.status(200).send(rows);
                 return;
               }
               
              if (tblCode == '') {
                const rows = {
                    success: "0",
                    message: "Please select a bazaar to batting.",
                  };
                 res.status(200).send(rows);
                 return;
              } else {
                if (bets.length == 0) {
                   const rows = {
                    success: "6",
                    message: "Please Check Minimum Bat Amount",
                  };
                 res.status(200).send(rows);
                 return;
                }
               
                
                // check min max
                for (var i = 0; i < bets.length; i++) { 
                  // res.status(200).send({'bets':'bets'});
                  if (bets[i]['crossing'] == 'yes') {
                    if (5 > parseInt(bets[i]['betamount'])) {
                       const rows = {
                          success: "6",
                          message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().crossingMin + "'. Please check your input.",
                        };
                      res.status(200).send(rows);
                      return;
                    }
                    if (parseInt(appcontroller.toJSON().crossingMax) < parseInt(bets[i]['betamount'])) {
                       const rows = {
                          success: "6",
                          message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().crossingMax + "'. Please check your input.",
                        };
                      res.status(200).send(rows);
                      return;
                    }
                  } else {
                    if (parseInt(bets[i]['bettype']) == 2) {
                      // res.status(200).send({rows:"uuu"});
                        // var harafchk1 = conn.query("SELECT HarufMin,HarufMax FROM app_controller", function(err, result) {
                            // if (err) throw err;
                            var harafchk = result[0];
                            if (parseInt(appcontroller.toJSON().HarufMin) > parseInt(bets[i]['betamount'])) {
                               const rows = {
                                success: "6",
                                message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().HarufMin + "'. Please check your input.",
                              };
                            res.status(200).send(rows);
                            return;
                            }
                            if (parseInt(appcontroller.toJSON().HarufMax) < parseInt(bets[i]['betamount'])) {
                                const rows = {
                                success: "6",
                                message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().HarufMax + "'. Please check your input.",
                              };
                            res.status(200).send(rows);
                            return;
                            }
                        // });
                    }
                      if (parseInt(bets[i]['bettype']) == 3) {
                            if (parseInt(appcontroller.toJSON().HarufMin) > parseInt(bets[i]['betamount'])) {
                               const rows = {
                                success: "6",
                                message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().HarufMin + "'. Please check your input.",
                              };
                            res.status(200).send(rows);
                            return;
                            }
                        if (parseInt(appcontroller.toJSON().HarufMax) < parseInt(bets[i]['betamount'])) {
                               const rows = {
                                success: "6",
                                message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().HarufMax + "'. Please check your input.",
                              };
                            res.status(200).send(rows);
                            return;
                            }
                      }
                    if (parseInt(bets[i]['bettype']) == 1) {
                      // res.status(200).send({ 'sd': parseInt(appcontroller.toJSON().jodi_min) });
                            if (parseInt(appcontroller.toJSON().jodi_min) > parseInt(bets[i]['betamount'])) {
                               const rows = {
                                success: "6",
                                message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().jodi_min + "'. Please check your input.",
                              };
                            res.status(200).send(rows);
                            return;
                            }
                       if (parseInt(appcontroller.toJSON().jodi_max) < parseInt(bets[i]['betamount'])) {
                              const rows = {
                                success: "6",
                                message: "Bet value '" + bets[i]['betamount'] + "' is below the minimum bet '" + appcontroller.toJSON().jodi_max + "'. Please check your input.",
                              };
                            res.status(200).send(rows);
                            return;
                            }
                    }
                    
                  }
                }
                
                var cond = 0;
               
                    if (timecStatus == 1) {
                        for (var i = 0; i < bets.length; i++) {
                            var betamount = bets[i]['betamount'];
                            var betkey = bets[i]['betkey'];
                          var betType = bets[i]['bettype'];
                             
                          const sqlQuery = {
                          table_id: tblCode,
                            user_id: req.body.user_id,
                            pred_num: betkey,
                          };
                          var sdata = 0;
                          const result1 = await gameLoadModal.find(sqlQuery)
                            .select('tr_value');
                            for(var j=0; j < result1.length; j++){
                                  sdata += parseInt(result1[j]['tr_value']);
                              }
                            //  console.log('i am here');
                                if ((parseInt(sdata) + parseInt(betamount)) > parseInt(comxMarket.toJSON().lamount)) {
                                    cond = 1;
                                    break;
                                }
                        }
                       
                      if (cond == 1) {
                          const rows = {
                            success: "6",
                            message: "👉लास्ट टाइम मैं एक जोड़ी आप सिर्फ " + comxMarket.toJSON().lamount + " into खेल सकते हो । 👉अब दूसरी जोड़ियां लगा सकते हो या फिर टाइम से लगाया करो । 🙏धन्यवाद🙏",
                          };
                        res.status(200).send(rows);
                        return;
                        }
                    }
                    // console.log('i ma here..');
                    const usersFour = await User.findOne({
                      user_id: req.body.user_id,
                      app_id: req.body.app_id,
                      user_status: 1,
                    });
                    var row_chk_user11 = usersFour;
                    if (row_chk_user11) {
                     
                      if (row_chk_user11.toJSON().user_type == "master" && row_chk_user11.toJSON().commission != 0) { 
                    var total_played = parseInt(row_chk_user11.toJSON().total_played) + parseInt(amount);
                    var bonus = parseInt(row_chk_user11.toJSON().ref_bonous) + (parseInt(amount) * parseInt(row_chk_user11.toJSON().commission) / 100);
                    var bs = ((parseInt(amount) * parseInt(row_chk_user11.toJSON().commission)) / 100);
                   const count01 = await User.find().sort({ id: 'desc' }).limit(1).exec();
                    if (count01.length>0) {
                      
                      var ids01 = count01[0].id + 1;
                    } else {
                      var ids01 = 1;
                    }
                      const newBonus11 = new User(
                        {
                        id:ids01,
                      user_id: req.body.user_id,
                        played: amount,
                        bonus: bs,
                        market_id: tblCode
                      }
                        );
                        
                        newBonus11.save()
                        const count02 = await bonusModal.find().sort({ id: 'desc' }).limit(1).exec();
                          if (count02.length>0) {
                            
                            var ids02 = count02[0].id + 1;
                          } else {
                            var ids02 = 1;
                          }
                         const newBonus111 = new bonusModal(
                           {
                            id:ids02,
                          user_id: req.body.user_id,
                          played: amount,
                          bonus: bs,
                          market_id: tblCode
                          }
                            );
                      newBonus111.save()
                   
                       
                    const currentDate = new Date();
                    const Datetodayes = format(currentDate, 'dd-MM-yyyy');
                    const formattedDateTimees = format(currentDate, 'yyyy-MM-dd HH:mm:ss');
                          const count03 = await bonusReportModal.find().sort({ id: 'desc' }).limit(1).exec();
                          if (count03.length>0) {
                            
                            var ids03 = count03[0].id + 1;
                          } else {
                            var ids03 = 1;
                          }
                        const newBonus21 = new bonusReportModal(
                          {
                            id:ids03,
                         transaction_id:tr_id,
                         type:'Credit',
                         win_value:bs,
                         value_update_by:'Game',
                         user_id:req.body.user_id,
                         app_id:req.body.app_id,
                         tr_nature:'TRGAME001',
                         tr_value:amount,
                         tr_value_updated:bonus,
                         date:Datetodayes,
                         date_time:formattedDateTimees,
                         tr_status:'Success',
                         table_id:tblCode,
                         created_at:formattedDateTimees,
                         tr_remark:'Game Bet'
                          }
                            );
                        newBonus21.save()
                        
                    await User.updateOne(
                      {
                        user_id: req.body.user_id,
                        app_id: req.body.app_id
                      },
                      {
                        $set: {
                          total_played: total_played,
                          ref_bonous: bonus
                        }
                      }
                    );
                        var total_played1 = parseInt(row_chk_user11.toJSON().my_played) + parseInt(amount);
                       await User.updateOne(
                      {
                        user_id: req.body.user_id,
                        app_id: req.body.app_id
                      },
                      {
                        $set: {
                          my_played: total_played1
                        }
                      }
                    );
                      } else {
                    var total_played = parseInt(row_chk_user11.toJSON().total_played) + parseInt(amount);
                    var bonus = parseInt(row_chk_user11.toJSON().ref_bonous) + (parseInt(amount) * parseInt(appcontroller.toJSON().ref_comm) / 100);
                  }
                    }
                
                 var newbalance = ((parseInt(balance) - parseInt(amount)));
                 //     const currentDate = new Date();
                 // const Datetodayes = format(currentDate, 'dd-MM-yyyy');
                 // const formattedDateTimees = format(currentDate, 'yyyy-MM-dd HH:mm:ss');
                 const currentDate = new Date();
                 // Format the date as 'DD-MM-YYYY'
                 const Datetodayes = moment(currentDate).format('DD-MM-YYYY');
                 //  console.log('Formatted Date:', Datetodayes);
                 
                 // Format the date and time as 'YYYY-MM-DD HH:mm:ss'
                 const formattedDateTimees = moment(currentDate).format('YYYY-MM-DD HH:mm:ss');
                const count04 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
                          if (count04.length>0) {
                            
                            var ids04 = count04[0].id + 1;
                          } else {
                            var ids04 = 1;
                          }
                 const newBonus = new walletReportModal(
                   {
                        id:ids04,
                      transaction_id: tr_id,
                      game_type:betType,
                      type:'Debit',
                      value_update_by: 'Game',
                      app_id:req.body.app_id,
                      user_id: req.body.user_id,
                      tr_nature:'TRGAME001',
                      tr_value:amount,
                      tr_value_updated:newbalance,
                      date:Datetodayes,
                      date_time:formattedDateTimees,
                      tr_status:'Success',
                      table_id: tblCode,
                      created_at:formattedDateTimees,
                      tr_remark: 'Game Bet',
                      betLimitStatus:timecStatus,
                      req_id:req.body.batuniqueid,
                      btype:req.body.btype
                      }
                  );
                newBonus.save()
                
                    
                   var cbalance = ((parseInt(credit) - parseInt(amount)));
                if (cbalance < 0) {
                      //  res.status(200).send({"rows":"erre"});
                        var creditdeduct = 0;
                        var windeduct = ((parseInt(amount) - parseInt(credit)));
                        var win_amount = win_amount - windeduct;
                      
                         await User.updateOne(
                          {
                            user_id: req.body.user_id,
                            app_id: req.body.app_id
                          },
                          {
                            $set: {
                              credit: creditdeduct,
                              win_amount: win_amount
                            }
                          }
                        );
                } else {
                  // res.status(200).send({"rows":"rtyui","tyty":cbalance});
                        await User.updateOne(
                          {
                            user_id: req.body.user_id,
                            app_id: req.body.app_id
                          },
                          {
                            $set: {
                              credit: cbalance
                            }
                          }
                        );
                    }
                    
                    // res.status(200).send({"rows":bets.length});
                  
                      for (var i = 0; i < bets.length; i++) {
                        // bets.forEach((bts, i) => {
                            var betamount = bets[i].betamount;
                            var betkey = bets[i].betkey;
                            var betType = bets[i].bettype;
                            if (bets[i] != null) {
                              var uniquid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                     const currentDate = new Date();
                                    // Format the date as 'DD-MM-YYYY'
                                    const Datetodayes = moment(currentDate).format('DD-MM-YYYY');
                                    //  console.log('Formatted Date:', Datetodayes);
                                    
                                    // Format the date and time as 'YYYY-MM-DD HH:mm:ss'
                                    const formattedDateTimees = moment(currentDate).format('YYYY-MM-DD HH:mm:ss');
                                  
                                    const count05 = await gameLoadModal.find().sort({ id: 'desc' }).limit(1).exec();
                                    console.log(count05.length);
                                    if (count05.length > 0) {
                                      var ids05 = count05[0].id + 1;
                                    } else {
                                      var ids05 = 1;
                                    }
                              
                               const newBonus1 = new gameLoadModal(
                                 {
                                      id:ids05,
                                        user_id: req.body.user_id,
                                        uniquid:uniquid,
                                        marketname:req.body.market_name,
                                        bettype:req.body.btype,
                                        game_type:req.body.betType,
                                        transaction_id: tr_id,  
                                        app_id:req.body.app_id,
                                        tr_nature:'TRGAME001',
                                        tr_value:betamount,
                                        date:Datetodayes,
                                        date_time:formattedDateTimees, 
                                        tr_status:'Success',
                                        table_id: tblCode,
                                        pred_num:betkey,
                                        created_at:formattedDateTimees,
                                        betLimitStatus:timecStatus,
                                    }
                                );
                              newBonus1.save()
                            }
                            // if(bets.length == i){
                            //   exist;
                            // }
                            
                      }
                    const rows = {
                      success: "1",
                      message: "Game Played Successfully Check in History.",
                      credit:newbalance 
                    };
                    res.status(200).send(rows);
                    return;



              }


            } else {
                  const rows = {
                    success: "3",
                    message: "User Not Exits Or Blocked Please Check Again",
                  };
                 res.status(200).send(rows);
                //  process.exit();
                return;

                }
          }
        }
        else
        {
          res.status(200).send({ status:"0",message:"User Not Available Or Blocked" });
          return;
        }
       }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
function strtotime(date, marketOpenTime) {
  const dateObj = new Date(date);
  const marketOpenTimeObj = new Date(date + " " + marketOpenTime);

  const differenceInMillis = marketOpenTimeObj - dateObj;
  const differenceInSeconds = differenceInMillis / 1000;

  return differenceInSeconds;
}
  function strtotimeStep2(date) {
  const dateObj = new Date(date);
  return Math.floor(dateObj.getTime() / 1000); // Convert milliseconds to seconds
  }
  function formatDateUpperside(customTime, minutesSubtract) {
  const customTimeObj = new Date(`1970-01-01 ${customTime}`);
  const resultTimeObj = new Date(customTimeObj.getTime() - minutesSubtract * 60000); // Convert minutes to milliseconds

  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

  return resultTimeObj.toLocaleTimeString('en-US', options);
  }
  function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
  }
  function formatDate(timestamp) {
  const dateObj = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

  return dateObj.toLocaleDateString('en-US', options);
}
};
exports.bat_delete = async (req, res) => {
  try {

      const result = schemaDeleteBat.validate(req.body);
      if (result.error) {
         res.status(200).json({ message: result.error.message });
      } else {
       
        const gameLoad = await gameLoadModal.findOne({
          user_id: req.body.user_id,
          id:req.body.bet_id,
        });
        if (gameLoad) {
          function check_time(market_id, comxMarket, appcontroller) {
            if (comxMarket) {
                 
              // const appcontroller = await appController.findOne();
            
              const marketOpenTime = comxMarket.toJSON().market_view_time_open;
              const marketCloseTime = comxMarket.toJSON().market_view_time_close;
              const mini_bet = appcontroller.toJSON().jodi_min;
              const max_bet = appcontroller.toJSON().jodi_max;
              const custom_time = marketCloseTime;
              var MinutesDB = comxMarket.toJSON().minute;
              // const resultTime = moment(custom_time, 'YYYY-MM-DD HH:mm:ss').subtract(MinutesDB, 'minutes');

              // const new_time = resultTime.format('H:i:s');

              const row2Minute = comxMarket.toJSON().minute; // Replace this with your value from $row2['minute']

              const new_time = formatDateUpperside(custom_time, row2Minute);
            
            

              const timestamp = getCurrentTimestamp();
              const date = formatDate(timestamp);
            
              const openTimeSec = strtotime(date, marketOpenTime);
              const closeTimeSec = strtotime(date, marketCloseTime);
            
              const dateTimestamp = strtotimeStep2(date);
            
              const currentTimeSec = timestamp - dateTimestamp;
              const remainingTimeSec = closeTimeSec - currentTimeSec;
              const betCloseSec = remainingTimeSec - 60;
              var betChangeSec = betCloseSec - (MinutesDB * 60);
              if (betChangeSec < 0) {
                betChangeSec = 0;
              }
              // res.status(200).send({"openTimeSec":openTimeSec,"currentTimeSec":currentTimeSec,"closeTimeSec":closeTimeSec,"currentTimeSec":currentTimeSec,"betCloseSec":betCloseSec});
              if (openTimeSec <= currentTimeSec && closeTimeSec > currentTimeSec && betCloseSec > 0) {
                // res.status(200).send({"openTimeSec":"openTimeSec"});
                return true;
                // const rows = {
                //   status: "1",
                //   message: "Bet available",
                //   gap_time: new_time,
                //   remaining_time_in_seconds: remainingTimeSec,
                //   betpoint_change_time: betChangeSec,
                //   points: users.toJSON().credit + users.toJSON().win_amount,
                //   isLimit: comxMarket.toJSON().is_time_limit_applied,
                
                // };
               
                // if (betChangeSec <= 0 && comxMarket.toJSON().is_time_limit_applied == 1) {
                //   rows.mini_bet = '5';
                //   rows.max_bet = comxMarket.toJSON().lamount;
                //   rows.h_max_bet = comxMarket.toJSON().h_max_limit;
                // } else {
                //   rows.mini_bet = mini_bet;
                //   rows.max_bet = max_bet;
                //   rows.h_max_bet = max_bet;
                // }
              
              } else if (market_id === 'DISAW') {
                const ctime = moment().format("HH:mm");
                const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
                if (!(moment(ctime, "HH:mm").isBetween(moment("02:40", "HH:mm"), moment("09:00", "HH:mm")))) {
                  let rangeEnd;
                  if (moment(ctime, "HH:mm").isBetween(moment("09:00", "HH:mm"), moment("23:59", "HH:mm"))) {
                    const currentTime = moment();
                    // Get tomorrow's date at 02:40 AM
                    const tomorrowTime = moment().add(1, 'day').set({ hour: 2, minute: 40, second: 0, millisecond: 0 });
                    // Calculate the difference in minutes
                    const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                    rangeEnd = (minuteDifference * 60) + 60;
                  } else {
                    // res.status(200).send({ "data": rangeEnd });
                    // rangeEnd = moment("today 02:40 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                    const currentTime = moment();
                    // Get tomorrow's date at 02:40 AM
                    const tomorrowTime = moment().add(0, 'day').set({ hour: 2, minute: 40, second: 0, millisecond: 0 });
                    // Calculate the difference in minutes
                    const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                    rangeEnd = (minuteDifference * 60) + 60;
                  }
                
                  if (rangeEnd != 0) {
                    return true;
                    //   const betChangeSec = rangeEnd - (30 * 60);
                    //   const rows = {
                    //       success: "1",
                    //       message: "Bet available",
                    //       remaining_time_in_seconds: rangeEnd,
                    //       betpoint_change_time: betChangeSec,
                    //       gap_time: new_time,
                    //       points: users.toJSON().credit + users.toJSON().win_amount,
                    //       isLimit: comxMarket.toJSON().is_time_limit_applied,
                    //       h_max_bet: comxMarket.toJSON().h_max_limit,
                    //       mini_bet: mini_bet,
                    //       max_bet: max_bet
                    //   };
                    // const isLimit = comxMarket.toJSON().is_time_limit_applied;
                    //     if (betChangeSec > 0 && isLimit == 1) {
                    //       return 1;
                    //     } else {
                    //       return 2;
                    //     }
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              } else if (market_id === 'SHIV ') {
                const ctime = moment().format("HH:mm");
                const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
                if (!(moment(ctime, "HH:mm").isBetween(moment("01:00", "HH:mm"), moment("09:00", "HH:mm")))) {
                  let rangeEnd;
                  if (moment(ctime, "HH:mm").isBetween(moment("09:00", "HH:mm"), moment("23:59", "HH:mm"))) {
                    const currentTime = moment();
                    // Get tomorrow's date at 02:40 AM
                    const tomorrowTime = moment().add(1, 'day').set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
                    // Calculate the difference in minutes
                    const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                    rangeEnd = (minuteDifference * 60) + 60;
                  } else {
                    // rangeEnd = moment("today 01:00 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                    const currentTime = moment();
                    // Get tomorrow's date at 02:40 AM
                    const tomorrowTime = moment().add(0, 'day').set({ hour: 1, minute: 0, second: 0, millisecond: 0 });
                    // Calculate the difference in minutes
                    const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                    rangeEnd = (minuteDifference * 60) + 60;
                  }
                  if (rangeEnd != 0) {
                    return true;
                    // const betChangeSec = rangeEnd - (30 * 60);
                    // const rows = {
                    //     success: "1",
                    //     message: "Bet available",
                    //     remaining_time_in_seconds: rangeEnd,
                    //     betpoint_change_time: betChangeSec,
                    //     gap_time: new_time,
                    //     points: users.toJSON().credit + users.toJSON().win_amount,
                    //     isLimit: comxMarket.toJSON().is_time_limit_applied,
                    //     h_max_bet: comxMarket.toJSON().h_max_limit,
                    //     mini_bet: mini_bet,
                    //     max_bet: max_bet
                    // };
                    // return 2;
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              } else if (market_id === 'MAFIY') {
                const ctime = moment().format("HH:mm");
                const ctime1 = moment().format("DD-MM-YYYY hh:mm a");
                if (!(moment(ctime, "HH:mm").isBetween(moment("02:45", "HH:mm"), moment("09:00", "HH:mm")))) {
                  let rangeEnd;
                  if (moment(ctime, "HH:mm").isBetween(moment("09:00", "HH:mm"), moment("23:59", "HH:mm"))) {
                    const currentTime = moment();
                    // Get tomorrow's date at 02:40 AM
                    const tomorrowTime = moment().add(1, 'day').set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
                    // Calculate the difference in minutes
                    const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                    rangeEnd = (minuteDifference * 60) + 60;
                  } else {
                    // rangeEnd = moment("today 02:45 am", "DD-MM-YYYY hh:mm a").diff(moment(ctime1, "DD-MM-YYYY hh:mm a"));
                    const currentTime = moment();
                    // Get tomorrow's date at 02:40 AM
                    const tomorrowTime = moment().add(0, 'day').set({ hour: 2, minute: 45, second: 0, millisecond: 0 });
                    // Calculate the difference in minutes
                    const minuteDifference = tomorrowTime.diff(currentTime, 'minutes');
                    rangeEnd = (minuteDifference * 60) + 60;
                  }
                  if (rangeEnd != 0) {
                    return true;
                    // const betChangeSec = rangeEnd - (30 * 60);
                    // const rows = {
                    //     success: "1",
                    //     message: "Bet available",
                    //     remaining_time_in_seconds: rangeEnd,
                    //     gap_time: new_time,
                    //     betpoint_change_time: betChangeSec,
                    //     points: users.toJSON().credit + users.toJSON().win_amount,
                    //     isLimit: comxMarket.toJSON().is_time_limit_applied,
                    //     h_max_bet: comxMarket.toJSON().h_max_limit,
                    //     mini_bet: mini_bet,
                    //     max_bet: max_bet
                    // };
                        
                    // return 2;
                  } else {
                    // const rows = {
                    //     success: "0",
                    //     message: "Bet Closed"
                    // };
                    return false;
                  }
                } else {
                  // const rows = {
                  //     success: "0",
                  //     message: "Bet Closed"
                  // };
                  return false;
                }
              } else {

                return false;

              }
            } else {
              return false;
            }
          };
          const comxMarket = await comxMarketModel.findOne({
            market_id: gameLoad.toJSON().table_id,
          });
          // res.status(200).send({ rows: "ppp" });
          const appcontroller = await appControllerModal.findOne();
          var chk = check_time(gameLoad.toJSON().table_id, comxMarket, appcontroller)
        
          if (chk == false) {
            const rows = {
              success: "3",
              message: "Market has been has been closed"
            };
            res.status(200).send(rows);
          }
       
          if (gameLoad) {
            var date1 = gameLoad.toJSON().betExpTime;
            const currentDate = moment();
            const currentdate = currentDate.format('DD-MM-YYYY');
            const date2 = currentDate.format('DD-MM-YYYY HH:mm:ss');

            var timestamp1 = strtotime(date1);
            var timestamp2 = strtotime(date2);
            if (timestamp1 > timestamp2) {
              var amount = gameLoad.toJSON().tr_value;
              const user = await User.findOne({
                user_id: req.body.user_id,
              });
              if (user) {
                const currentDate = moment();
                const data12 = currentDate.format('DD-MM-YYYY');
                const date11 = currentDate.format('DD-MM-YYYY HH:mm:ss');
                var userid = req.body.user_id;
                var referenceId = gameLoad.toJSON().transaction_id;
                var table_id = gameLoad.toJSON().table_id;
                var pred_num = gameLoad.toJSON().pred_num;

                if (gameLoad.toJSON().user_type == "master" && gameLoad.toJSON().commission != 0) {
                  var orderamount = (amount * gameLoad.toJSON().commission / 100);
                 
                  var updatedAmount = gameLoad.toJSON().ref_bonous - (amount * gameLoad.toJSON().commission / 100);
                 
                  await User.updateOne(
                    {
                      user_id: userid
                    },
                    {
                      $set: {
                        ref_bonous: updatedAmount
                      }
                    }
                  );
                   const count06 = await bonusReportModal.find().sort({ id: 'desc' }).limit(1).exec();
                    if (count06.length>0) {
                      
                      var ids06 = count06[0].id + 1;
                    } else {
                      var ids06 = 1;
                    }
                  const bonusReportModals = new bonusReportModal(
                    {
                      id:ids06,
                      transaction_id: referenceId,
                      type: 'Debit',
                      value_update_by: 'Game',
                      user_id: userid,
                      app_id: 'com.babaji.galigame',
                      tr_nature: 'TRGAME003',
                      tr_value: orderamount,
                      tr_value_updated: updatedAmount,
                      date: data12,
                      date_time: date11,
                      tr_status: 'Success',
                      tr_remark: 'Game Deleted',
                    }
                  );
                  bonusReportModals.save();
                }
              
                var updatedAmount11 = gameLoad.toJSON().credit + amount;
                var updatedAmount1 = (gameLoad.toJSON().credit + gameLoad.toJSON().win_amount) + amount;
                await User.updateOne(
                  {
                    user_id: userid
                  },
                  {
                    $set: {
                      credit: updatedAmount11
                    }
                  }
                );
                 const count07 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
                    if (count07.length>0) {
                      
                      var ids07 = count07[0].id + 1;
                    } else {
                      var ids07 = 1;
                    }
                const walletReportModals = new walletReportModal(
                  {
                    id:ids07,
                    type: 'Credit',
                    pred_num: pred_num,
                    table_id: table_id,
                    transaction_id: referenceId,
                    value_update_by: 'Deposit',
                    user_id: userid,
                    app_id: 'com.babaji.galigame',
                    tr_nature: 'TRREF006',
                    tr_value: amount,
                    tr_value_updated: updatedAmount1,
                    date: data12,
                    date_time: date11,
                    tr_status: 'Success',
                    tr_remark: 'Game Deleted',
                  }
                );
                walletReportModals.save();
                const gameLoadNewInser = await gameLoadModal.findOne({
                  id: betid
                });
                const walletReportModalsw = new deleted_betModal(gameLoadNewInser);
                walletReportModalsw.save();
                    
                await deleted_betModal.updateOne(
                  {
                    deleted_by: 'user'
                  },
                  {
                    $set: {
                      id: betid
                    }
                  }
                );
              
                await deleted_betModal.deleteMany(
                  {
                    uniquid: gameLoad.toJSON().uniquid
                  }
                );



                const rows = {
                  success: "1",
                  message: "Delete Successfully"
                };
                res.status(200).json(rows);









              } else {
                const rows = {
                  success: "0",
                  message: "User not available"
                };
                res.status(200).json(rows);
              }

            } else {
              const rows = {
                success: "0",
                message: "Bet will be delete after 10 minutes of bet placed"
              };
              res.status(200).json(rows);
            }

          } else {
            const rows = {
              success: "0",
              message: "Bet Closed"
            };
            res.status(200).json(rows);
          }
        } else {
           const rows = {
            success: "0",
            message: "Bet Not Found"
        };
          res.status(200).json(rows);
        }
       
       }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
function strtotime(date, marketOpenTime) {
  const dateObj = new Date(date);
  const marketOpenTimeObj = new Date(date + " " + marketOpenTime);

  const differenceInMillis = marketOpenTimeObj - dateObj;
  const differenceInSeconds = differenceInMillis / 1000;

  return differenceInSeconds;
}
  function strtotimeStep2(date) {
  const dateObj = new Date(date);
  return Math.floor(dateObj.getTime() / 1000); // Convert milliseconds to seconds
  }
  function formatDateUpperside(customTime, minutesSubtract) {
  const customTimeObj = new Date(`1970-01-01 ${customTime}`);
  const resultTimeObj = new Date(customTimeObj.getTime() - minutesSubtract * 60000); // Convert minutes to milliseconds

  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

  return resultTimeObj.toLocaleTimeString('en-US', options);
  }
  function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
  }
  function formatDate(timestamp) {
  const dateObj = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

  return dateObj.toLocaleDateString('en-US', options);
}
};
