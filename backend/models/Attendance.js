const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    checkInTime: {
      type: String,
      required: true,
    },
    checkOutTime: {
      type: String,
      required: true,
    },
    attendanceDate: {
      type: String,
      required: true,
    },
    checkInPhoto: {
      type: String, 
      required: true,
    },
    checkOutPhoto: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "empAttendance" }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
