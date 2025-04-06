const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Overtime = require("../models/Overtime");

// Helper to handle auto-checkout if no overtime is approved
const autoCheckoutIfNoOT = async (employeeID, shift) => {
  const currentTime = new Date();
  const currentDate = currentTime.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Check if attendance record exists for today
  const attendance = await Attendance.findOne({
    employeeID: employeeID,
    attendanceDate: currentDate,
  });

  if (attendance) {
    // If checkout time is not yet set, check if shift time has passed
    if (!attendance.checkOutTime) {
      const endTime =
        shift === "Morning" ? new Date(currentDate + " 18:01:00") : new Date(currentDate + " 22:01:00");

      // If current time is past the shift end time and no overtime is approved
      const overtimeRequest = await Overtime.findOne({
        employeeID: employeeID,
        dateRequested: currentDate,
        status: "approved",
      });

      if (!overtimeRequest && currentTime >= endTime) {
        // Auto-checkout
        attendance.checkOutTime = currentTime.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila" });
        attendance.attendanceStatus = "Completed";
        await attendance.save();
      }
    }
  }
};

// Helper to extend attendance records for overtime
const extendAttendanceForOT = async (employeeID, overtimeTime, overtimeDate) => {
  const attendance = await Attendance.findOne({
    employeeID: employeeID,
    attendanceDate: overtimeDate,
  });

  if (attendance) {
    // Add overtime hours to the total hours worked for that day
    attendance.totalHours += overtimeTime;
    await attendance.save();
  }
};

module.exports = {
  autoCheckoutIfNoOT,
  extendAttendanceForOT,
};
