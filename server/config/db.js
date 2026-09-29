const mongoose = require("mongoose");
let cached = global._mongo || (global._mongo = { conn: null, promise: null });
module.exports = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGO_URI);
  cached.conn = await cached.promise;
  return cached.conn;
};
