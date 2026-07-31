const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    website: { type: String },
    date: { type: String },
    status: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "result_website_links" }
);

module.exports = mongoose.model("ResultWebsiteLinks", bookSchema);
