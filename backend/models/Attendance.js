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
      required: false,
    },
    attendanceDate: {
      type: String,
      required: true,
    },
    checkInPhoto: {
      type: String,
      required: false,
    },
    checkOutPhoto: {
      type: String,
      required: false,
    },
    attendanceStatus: {
      type: String,
      required: true,
    },
    shift: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "empAttendance" }
);
module.exports =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
