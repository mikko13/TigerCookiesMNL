const express = require("express");
const mongoose = require("mongoose"); // 🔥 FIXED: Import mongoose
const { DateTime } = require("luxon");
const Checkin = require("../models/Checkin");
const Checkout = require("../models/Checkout");
const Attendance = require("../models/Attendance");

const router = express.Router();

// Function to check and record attendance
const recordAttendance = async (employeeID) => {
  try {
    if (!employeeID) {
      console.log("❌ Employee ID missing");
      return { success: false, message: "Employee ID is required." };
    }

    const philippineTime = DateTime.now().setZone("Asia/Manila");
    const attendanceDate = philippineTime.toFormat("MM-dd-yyyy");

    console.log(`🔍 Searching check-in & check-out for EmployeeID: ${employeeID} on ${attendanceDate}`);

    // Ensure employeeID is an ObjectId
    const employeeObjectId = new mongoose.Types.ObjectId(employeeID);

    // Find check-in and check-out records
    const checkinRecord = await Checkin.findOne({ employeeID: employeeObjectId, checkInDate: attendanceDate });
    const checkoutRecord = await Checkout.findOne({ employeeID: employeeObjectId, checkOutDate: attendanceDate });

    console.log(`✅ Check-in found:`, checkinRecord);
    console.log(`✅ Check-out found:`, checkoutRecord);

    if (!checkinRecord || !checkoutRecord) {
      return { success: false, message: "Check-in and Check-out records are required to log attendance." };
    }

    const attendance = await Attendance.findOneAndUpdate(
      { employeeID: employeeObjectId, attendanceDate },
      {
        employeeID: employeeObjectId,
        checkInTime: checkinRecord.checkInTime,
        checkOutTime: checkoutRecord.checkOutTime,
        checkInPhoto: checkinRecord.checkInPhoto,
        checkOutPhoto: checkoutRecord.checkOutPhoto,
        attendanceDate,
      },
      { upsert: true, new: true }
    );

    console.log(`🎯 Attendance recorded:`, attendance);
    return { success: true, message: "Attendance recorded successfully!", attendance };
  } catch (error) {
    console.error("🚨 Error recording attendance:", error);
    return { success: false, message: "Server error. Please try again." };
  }
};

// API endpoint to manually trigger attendance recording
router.post("/record", async (req, res) => {
  const { employeeID } = req.body;
  console.log(`🔍 Recording attendance for EmployeeID: ${employeeID}`);

  const result = await recordAttendance(employeeID);
  console.log(`🎯 Attendance API Result:`, result);

  res.status(result.success ? 201 : 400).json(result);
});

module.exports = router;
