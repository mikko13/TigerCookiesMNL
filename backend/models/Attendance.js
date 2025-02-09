const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    checkInTime: {
      type: String, // Format: HH:mm:ss
      required: true,
    },
    checkOutTime: {
      type: String, // Format: HH:mm:ss
      required: true,
    },
    attendanceDate: {
      type: String, // Format: MM-DD-YYYY
      required: true,
    },
    checkInPhoto: {
      type: String, // Stores filename of check-in photo
      required: true,
    },
    checkOutPhoto: {
      type: String, // Stores filename of check-out photo
      required: true,
    },
  },
  { timestamps: true, collection: "empAttendance" }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
