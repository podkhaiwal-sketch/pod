const mongoose = require("mongoose");

module.exports = async () => {
  const uri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gali";

  mongoose.connect(uri, {
    maxPoolSize: 50,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  const db = mongoose.connection;
  return db;
};
