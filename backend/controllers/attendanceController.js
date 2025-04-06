const { autoCheckoutIfNoOT, extendAttendanceForOT } = require("../utils/attendanceHelper");
const Attendance = require("../models/Attendance");
const Overtime = require("../models/Overtime");

// Handle attendance checkout
const handleAttendanceCheckout = async (req, res) => {
  const { employeeID, shift } = req.body;

  try {
    // Perform auto-checkout if no OT is approved
    await autoCheckoutIfNoOT(employeeID, shift);
    res.status(200).json({ message: "Attendance processed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error processing attendance." });
  }
};

// Handle overtime request and update attendance
const handleOvertime = async (req, res) => {
  const { employeeID, overtimeTime, overtimeDate } = req.body;

  try {
    // Extend attendance for overtime
    await extendAttendanceForOT(employeeID, overtimeTime, overtimeDate);
    res.status(200).json({ message: "Overtime hours added to attendance." });
  } catch (error) {
    res.status(500).json({ message: "Error updating overtime hours." });
  }
};

module.exports = {
  handleAttendanceCheckout,
  handleOvertime,
};
