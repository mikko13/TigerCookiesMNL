const express = require("express");
const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Checkin = require("../models/Checkin");
const Checkout = require("../models/Checkout");
const Attendance = require("../models/Attendance");
const Account = require("../models/Employees");
const router = express.Router();

const recordAttendance = async (employeeID) => {
  try {
    if (!employeeID) {
      return { success: false, message: "Employee ID is required." };
    }

    const philippineTime = DateTime.now().setZone("Asia/Manila");
    const attendanceDate = philippineTime.toFormat("MM-dd-yyyy");

    const employeeObjectId = new mongoose.Types.ObjectId(employeeID);

    const checkinRecord = await Checkin.findOne({
      employeeID: employeeObjectId,
      checkInDate: attendanceDate,
    });
    const checkoutRecord = await Checkout.findOne({
      employeeID: employeeObjectId,
      checkOutDate: attendanceDate,
    });

    if (!checkinRecord || !checkoutRecord) {
      return {
        success: false,
        message:
          "Check-in and Check-out records are required to log attendance.",
      };
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

    return {
      success: true,
      message: "Attendance recorded successfully!",
      attendance,
    };
  } catch (error) {
    return { success: false, message: "Server error. Please try again." };
  }
};

router.post("/record", async (req, res) => {
  const { employeeID } = req.body;
  console.log(`🔍 Recording attendance for EmployeeID: ${employeeID}`);

  const result = await recordAttendance(employeeID);
  console.log(`🎯 Attendance API Result:`, result);

  res.status(result.success ? 201 : 400).json(result);
});

router.get("/", async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate("employeeID", "firstName lastName")
      .lean();

    const formattedRecords = attendanceRecords.map((record) => ({
      _id: record._id,
      employeeName:
        record.employeeID && record.employeeID.firstName
          ? `${record.employeeID.firstName} ${record.employeeID.lastName}`
          : "Unknown Employee",
      attendanceDate: record.attendanceDate,
      checkinTime: record.checkInTime,
      checkinPhoto: record.checkInPhoto.startsWith("/")
        ? record.checkInPhoto
        : `${record.checkInPhoto}`,
      checkoutTime: record.checkOutTime,
      checkoutPhoto: record.checkOutPhoto.startsWith("/")
        ? record.checkOutPhoto
        : `${record.checkOutPhoto}`,
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Attendance.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found." });
    }

    res.json({
      success: true,
      message: "Attendance record deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Try again later." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { employeeID } = req.query; // Use query param to filter by employeeID

    let query = {};
    if (employeeID) {
      query.employeeID = employeeID;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("employeeID", "firstName lastName")
      .lean();

    const formattedRecords = attendanceRecords.map((record) => ({
      _id: record._id,
      employeeName: record.employeeID
        ? `${record.employeeID.firstName} ${record.employeeID.lastName}`
        : "Unknown Employee",
      attendanceDate: record.attendanceDate,
      checkinTime: record.checkInTime,
      checkinPhoto: record.checkInPhoto.startsWith("/")
        ? record.checkInPhoto
        : `${record.checkInPhoto}`,
      checkoutTime: record.checkOutTime,
      checkoutPhoto: record.checkOutPhoto.startsWith("/")
        ? record.checkOutPhoto
        : `${record.checkOutPhoto}`,
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});


module.exports = router;
