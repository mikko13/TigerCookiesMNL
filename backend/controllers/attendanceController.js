const { autoCheckoutIfNoOT, extendAttendanceForOT } = require("../utils/attendanceHelper");
const Attendance = require("../models/Attendance");
const Overtime = require("../models/Overtime");
const { DateTime } = require("luxon");

// Handle attendance checkout
const handleAttendanceCheckout = async (req, res) => {
  const { employeeID, shift } = req.body;

  try {
    // Fetch today's attendance record
    const attendance = await Attendance.findOne({
      employeeID: new mongoose.Types.ObjectId(employeeID),
      attendanceDate: DateTime.now().toFormat("MM-dd-yyyy"),
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: "Attendance record not found." });
    }

    // If no overtime is approved, perform auto-checkout
    if (!attendance.overtimeHours || attendance.overtimeHours === 0) {
      await autoCheckoutIfNoOT(employeeID, shift);
      return res.status(200).json({ message: "Attendance processed successfully." });
    }

    // If overtime is approved, extend attendance
    await extendAttendanceForOT(employeeID, attendance.overtimeHours, attendance.attendanceDate);
    res.status(200).json({ message: "Attendance processed with overtime." });
  } catch (error) {
    console.error("Error processing attendance:", error);
    res.status(500).json({ message: "Error processing attendance." });
  }
};

// Handle overtime request and update attendance
const handleOvertime = async (req, res) => {
  const { employeeID, overtimeHours, overtimeStartTime, overtimeReason } = req.body;

  try {
    // Fetch today's attendance record
    const attendance = await Attendance.findOne({
      employeeID: new mongoose.Types.ObjectId(employeeID),
      attendanceDate: DateTime.now().toFormat("MM-dd-yyyy"),
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: "Attendance record not found." });
    }

    // Update attendance with overtime details
    attendance.overtimeHours = overtimeHours;
    attendance.overtimeStart = overtimeStartTime;
    attendance.overtimeEnd = DateTime.fromISO(overtimeStartTime)
      .plus({ hours: overtimeHours })
      .toFormat("HH:mm:ss");
    attendance.autoCheckoutScheduled = false; // Reset auto-checkout flag

    await attendance.save();

    // Schedule auto-checkout if overtime is requested and no manual checkout
    const overtimeEndTime = DateTime.fromISO(attendance.overtimeEnd).plus({ minutes: 5 }).toFormat("HH:mm:ss");

    if (!attendance.checkOutTime && !attendance.autoCheckoutScheduled) {
      const newCheckout = new Checkout({
        employeeID,
        checkOutTime: overtimeEndTime,
        attendanceDate: DateTime.now().toFormat("MM-dd-yyyy"),
      });

      // Save the auto-checkout record
      await newCheckout.save();

      // Mark auto-checkout as scheduled
      attendance.autoCheckoutScheduled = true;
      await attendance.save();

      return res.status(200).json({
        success: true,
        message: `Overtime requested. Auto-checkout scheduled at ${overtimeEndTime}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Overtime requested, no auto-checkout scheduled (manual checkout expected).",
    });
  } catch (error) {
    console.error("Error handling overtime:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  handleAttendanceCheckout,
  handleOvertime,
};
