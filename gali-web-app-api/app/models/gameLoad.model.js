const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number },
    uniquid: { type: String },
    req_id: { type: String },
    game_type: { type: Number },
    app_id: { type: String },
    user_id: { type: String },
    tr_nature: { type: String },
    bettype: { type: String },
    marketname: { type: String },
    win_value: { type: Number, default: 0 },
    tr_value: { type: Number },
    date: { type: String },
    bet_place_date_time: { type: String },
    date_time: { type: String },
    mobile: { type: String },
    tr_status: { type: String },
    table_id: { type: String },
    transaction_id: { type: String },
    is_win: { type: Number, default: 0 },
    is_result_declared: { type: Number, default: 0 },
    pred_num: { type: String },
    betLimitStatus: { type: Number, default: 0 },
    win_rate: { type: Number },
    is_deleted: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    login_url: { type: String, default: null },
  },
  { collection: "game_load" }
);

// async function connect() {
//   try {
//     await mongoose.connect('mongodb+srv://anmolroot:EcUq8irxTWUXkLru@babajee.gwcxwd4.mongodb.net/bbm001');
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('Error connecting to MongoDB:', err);
//   }
// }

// // Disconnect from MongoDB
// async function disconnect() {
//   try {
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//   } catch (err) {
//     console.error('Error disconnecting from MongoDB:', err);
//   }
// }

// const gameLoad = mongoose.model('gameLoad', bookSchema);

// module.exports = { gameLoad, connect, disconnect };

module.exports = mongoose.model("gameLoad", bookSchema);
