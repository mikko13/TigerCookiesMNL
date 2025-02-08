const mongoose = require("mongoose");

const CheckinSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    checkInTime: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: String,
      required: true,
    },
    checkInPhoto: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "empCheckIn" }
);

module.exports = mongoose.model("Checkin", CheckinSchema);
