const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    inFace: { type: String },
    checkinTime: { type: String },
    checkinDate: { type: String },
  },
  { timestamps: true, collection: "empCheckin" }
);

module.exports = mongoose.model("Checkin", checkinSchema);
