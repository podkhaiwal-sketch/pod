module.exports = (app) => {
  const users = require("../controllers/user.controller.js");
  const updateprofile = require("../controllers/profileuser.controller.js");
  const bethistory = require("../controllers/bethistory.controller.js");
  const pendingbethistory = require("../controllers/pendingbethistory.controller.js");
  const withdrawlhistory = require("../controllers/withdrawlhistory.controller.js");
  const viewBoardCast = require("../controllers/viewboardcast.controller.js");
  const commons = require("../controllers/common.controller.js");
  const numTable = require("../controllers/numTable.controller.js");
  const batStore = require("../controllers/batStore.controller.js");
  const home = require("../controllers/home.controller.js");
  const bankdetails = require("../controllers/bankdetails.controller.js");
  const chatStore = require("../controllers/chatStore.controller.js");
  const batDelete = require("../controllers/batDelete.controller.js");
  const userWithdrawDetails = require("../controllers/userWithdrawDetails.controller.js");

  var router = require("express").Router();

  router.post("/login", users.login);
  router.post("/register-step1", users.POMregisterstep1);
  router.post("/register", users.POMregister);

  router.post("/login-new", users.sendOtpNew);
  router.post("/login-chkotp-new", users.loginChkotpNew);
  router.post("/send-otp-withdraw", users.sendOtpWithdraw);
  router.post("/POM_get_user_profile", users.getUserProfile);

  router.post("/user-update-reffercode", users.updateRefferCode);
  router.post("/user-refferlist", users.refferlist);
  router.post("/user-update-lat-long", users.updateUserLatLong);
  router.post("/bet-history", bethistory.getBetHistory);
  router.post("/pending-bet-history", pendingbethistory.getPendingBetHistory);
  router.post("/user-profile-update", users.updateUserProfile);
  router.post("/user-credit", users.getUserCredit);
  router.post("/wallet-report", users.walletReport);
  router.post("/user-withdrawl", users.getUserAccount);
  router.post("/withdrawl-history", withdrawlhistory.withdrawalReport);
  router.post("/view-boardcast", viewBoardCast.markBroadcastSeen);
  router.post("/boardcast", viewBoardCast.getBoardcasts);
  router.post("/latest-boardcast", viewBoardCast.getLatestBoardcasts);
  router.post("/bank-details", bankdetails.getUserBankDetails);
  router.post("/user-deduct-list", userWithdrawDetails.getUserdeduct);

  router.post("/get-market-list", commons.getMarketList);
  router.post("/POM_help_number", commons.getHelpDetails);
  router.post("/POM_app_notice", commons.getNoticeDetails);
  router.post("/get-numtable-list", numTable.getNumTableList);
  router.post("/bat-place", batStore.bat_place);
  router.post("/bat-delete", batDelete.bat_delete);
  router.post("/get-group-message", home.get_group_msg);
  router.post("/home", home.home_list);
  router.post("/result-links", home.resultLink);
  router.post("/transfer", home.transfer_store);
  router.post("/single-market-result", home.single_market_result);
  router.post("/all-game-results-by-month", home.all_game_results_by_month);
  router.get("/all-game-results-by-month", home.all_game_results_by_month_get);
  router.post("/deduct-user-balance", home.deduct_user_balance);
  router.post("/app-manager", home.app_manager);
  router.post("/add-account", home.add_account);
  router.post("/addMsg-Group", home.addMsgGroup);
  router.post("/deduct-withdrawweb", home.deduct_withdrawweb);
  router.post("/deduct-withdrawUpiweb", home.deduct_withdrawUpiweb);
  router.post("/imb-create-order", home.create_imb_order);
  router.get("/imb-create-order", home.imb_create_order_get);
  router.post("/imb-check-order-status", home.check_imb_order_status);
  router.get("/imb-check-order-status", home.imb_check_order_status_get);
  router.post("/imb-list-orders", home.imb_list_orders);
  router.get("/imb-list-orders", home.imb_list_orders_get);
  router.post("/imb-sync-pending-orders", home.imb_sync_pending_orders);
  router.get("/imb-sync-pending-orders", home.imb_sync_pending_orders_get);
  /** GET-only: pending + failed → IMB check → status + wallet credit if paid */
  router.get("/imb-get-sync-webhook", home.imb_get_payment_sync_webhook);
  router.get("/imb-payment-webhook", home.imb_payment_webhook_get);
  router.post("/imb-payment-webhook", home.imb_payment_webhook);
  router.post("/add-bank-account", home.add_bank_account);
  router.post("/get-all-bank-account", home.get_bank_accountAll);
  router.post("/get-success-bank-account", home.get_bank_accountSuccess);
  router.post("/chat-list", chatStore.chat_list);
  router.post("/unseen-chat-count", chatStore.unseen_chat_count);
  router.post("/unseen-chat-update", chatStore.unseen_chat_update);
  router.post("/bonus-report-list", bethistory.bonus_report_list);
  router.post("/bonus-report-redem", bethistory.bonus_report_redem);
  router.post("/manage-commission", users.manageCommission);

  // router.post("/web-Audio", chatStore.web_Audio);

  app.post("/imb-api/api/create-order", home.create_imb_order);
  app.get("/imb-api/api/create-order", home.imb_create_order_get);
  app.post("/imb-api/api/check-order-status", home.check_imb_order_status);
  app.get("/imb-api/api/check-order-status", home.imb_check_order_status_get);
  app.get("/imb-api/api/list-orders", home.imb_list_orders_get);
  app.get("/imb-api/api/sync-pending-orders", home.imb_sync_pending_orders_get);
  app.get("/imb-api/api/get-sync-webhook", home.imb_get_payment_sync_webhook);
  app.get("/imb-api/api/webhook", home.imb_payment_webhook_get);
  app.post("/imb-api/api/webhook", home.imb_payment_webhook);

  app.use("/api/users", router);

  // Aliases: misconfigured clients / proxies that POST to `/register-step1` without `/api/users`
  app.post("/register-step1", users.POMregisterstep1);
  app.post("/register", users.POMregister);
  // app.use('/api/wallet', router);
};