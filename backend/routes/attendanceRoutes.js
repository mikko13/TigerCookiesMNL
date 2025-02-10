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

  const result = await recordAttendance(employeeID);

  res.status(result.success ? 201 : 400).json(result);
});

router.get("/", async (req, res) => {
  try {
    const { employeeID, isAdmin } = req.query;

    let attendanceRecords;

    if (isAdmin === "true") {
      attendanceRecords = await Attendance.find()
        .populate("employeeID", "firstName lastName _id")
        .lean();
    } else if (employeeID) {
      const employeeObjectId = new mongoose.Types.ObjectId(employeeID);

      attendanceRecords = await Attendance.find({
        employeeID: employeeObjectId,
      })
        .populate("employeeID", "firstName lastName _id")
        .lean();
    } else {
      return res
        .status(400)
        .json({ error: "Employee ID or Admin status required" });
    }

    const formattedRecords = attendanceRecords.map((record) => ({
      _id: record._id,
      employeeID: record.employeeID._id.toString(),
      employeeName: record.employeeID
        ? `${record.employeeID.firstName} ${record.employeeID.lastName}`
        : "Unknown Employee",
      attendanceDate: record.attendanceDate,
      checkinTime: record.checkInTime,
      checkinPhoto: record.checkInPhoto,
      checkoutTime: record.checkOutTime,
      checkoutPhoto: record.checkOutPhoto,
    }));

    res.json(formattedRecords);
  } catch (error) {
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
    res
      .status(500)
      .json({ success: false, message: "Server error. Try again later." });
  }
});

module.exports = router;
