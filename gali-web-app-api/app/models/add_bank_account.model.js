const mongoose = require("mongoose");

// const bookSchema = new mongoose.Schema({

//    id: {type:Number},
//   user_id: { type: String},
//   bank_name: { type: String},
//   account_holder: { type: String},
//   account_number: { type: String},
//   ifsc_code: { type: String},
//   app_id: { type: String},
//   status: { type: String},
//   amount: { type: Number},
//   created_at: { type: Date, default:Date.now},
//   updated_at: { type: Date, default:Date.now},
// },{ collection: 'deduct_withraw'});
const bookSchema = new mongoose.Schema(
  {
    id: { type: Number },
    user_id: { type: String },
    mob: { type: String },
    name: { type: String },
    bank_name: { type: String },
    account_holder: { type: String },
    account_number: { type: String },
    ifsc_code: { type: String },
    app_id: { type: String },
    login_url: { type: String, default: null },

    status: { type: String },
    // amount: { type: Number},
    date: {
      type: String,
      default: () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}/${month}/${year}`;
      },
    },
    date_time: {
      type: String,
      default: () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, "0");
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12; // Convert 0 to 12
        const hourFormatted = String(hour12).padStart(2, "0");
        return `${day}-${month}-${year} ${hourFormatted}:${minutes}:${seconds} ${ampm}`;
      },
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "add_bank_account" }
);

module.exports = mongoose.model("add_bank_account", bookSchema);
