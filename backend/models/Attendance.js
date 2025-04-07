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
    totalHours: {
      type: Number,
      default: 0,
    },
    overtimeStart: {
      type: String,
      required: false,
    },
    overtimeEnd: {
      type: String,
      required: false,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    startOT: {  // New field for overtime start time
      type: String,
      required: false,
    },
    endOT: {  // New field for overtime end time
      type: String,
      required: false,
    },
    autoCheckoutScheduled: {  // New field to track if auto-checkout was scheduled
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: "empAttendance" }
);

module.exports =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
