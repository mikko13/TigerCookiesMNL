const express = require("express");
const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Checkin = require("../models/Checkin");
const Checkout = require("../models/Checkout");
const Attendance = require("../models/Attendance");
const Account = require("../models/Employees");
const multer = require("multer");
const router = express.Router();
const { handleAttendanceCheckout, handleOvertime } = require("../controllers/attendanceController");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "checkInPhoto") {
      cb(
        null,
        path.join(__dirname, "../../frontend/public/employee-checkin-photos")
      );
    } else if (file.fieldname === "checkOutPhoto") {
      cb(
        null,
        path.join(__dirname, "../../frontend/public/employee-checkout-photos")
      );
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
  filename: (req, file, cb) => {
    const { employeeID, attendanceDate } = req.body;
    const formattedDate = attendanceDate
      ? DateTime.fromISO(attendanceDate).toFormat("MM-dd-yyyy")
      : DateTime.now().toFormat("MM-dd-yyyy");

    const fileExt = path.extname(file.originalname);

    let filename = "";
    if (file.fieldname === "checkInPhoto") {
      filename = `checkin_${employeeID}_${formattedDate}${fileExt}`;
    } else if (file.fieldname === "checkOutPhoto") {
      filename = `checkout_${employeeID}_${formattedDate}${fileExt}`;
    }

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG/JPEG/PNG images are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

const getAttendanceStatus = (checkInTime, shift) => {
  if (!checkInTime) return "Absent";

  const checkInTimeObj = DateTime.fromFormat(checkInTime, "HH:mm:ss");
  let lateThreshold;

  if (shift === "morning") {
    lateThreshold = DateTime.fromFormat("09:01:00", "HH:mm:ss");
  } else if (shift === "afternoon") {
    lateThreshold = DateTime.fromFormat("13:01:00", "HH:mm:ss");
  } else {
    lateThreshold = DateTime.fromFormat("09:01:00", "HH:mm:ss");
  }

  return checkInTimeObj >= lateThreshold ? "Late" : "Present";
};

const calculateTotalHours = (checkInTime, checkOutTime, shift) => {
  if (!checkInTime || !checkOutTime) return 0;

  try {
    let checkIn = DateTime.fromFormat(checkInTime, "HH:mm:ss");
    const checkOut = DateTime.fromFormat(checkOutTime, "HH:mm:ss");

    const morningShiftStart = DateTime.fromFormat("09:00:00", "HH:mm:ss");
    const afternoonShiftStart = DateTime.fromFormat("13:00:00", "HH:mm:ss");

    let shiftStart;
    if (shift === "morning" || shift === "Morning") {
      shiftStart = morningShiftStart;
    } else if (shift === "afternoon" || shift === "Afternoon") {
      shiftStart = afternoonShiftStart;
    } else {
      shiftStart = morningShiftStart;
    }

    if (checkIn < shiftStart) {
      checkIn = shiftStart;
    }

    let latenessHours = 0;
    if (checkIn > shiftStart) {
      const minutesLate = checkIn.diff(shiftStart, "minutes").minutes;
      if (minutesLate > 0) {
        latenessHours = Math.ceil(minutesLate / 60);
      }
    }

    let diff = checkOut.diff(checkIn, "hours").hours;

    if (diff < 0) {
      diff = checkOut.plus({ days: 1 }).diff(checkIn, "hours").hours;
    }

    const totalHours = Math.max(0, diff - latenessHours);

    return Math.round(totalHours * 100) / 100;
  } catch (error) {
    console.error("Error calculating total hours:", error);
    return 0;
  }
};

router.post(
  "/post",
  upload.fields([
    { name: "checkInPhoto", maxCount: 1 },
    { name: "checkOutPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { employeeID, attendanceDate, checkInTime, checkOutTime, shift } =
        req.body;

      if (!employeeID || !attendanceDate || !checkInTime || !shift) {
        return res.status(400).json({
          success: false,
          message: "Employee ID, date, check in time, and shift are required.",
        });
      }

      let formattedCheckInTime = null;
      let formattedCheckOutTime = null;

      try {
        formattedCheckInTime = checkInTime
          ? DateTime.fromISO(checkInTime).toFormat("HH:mm:ss")
          : null;
      } catch (error) {
        formattedCheckInTime = checkInTime;
      }

      try {
        formattedCheckOutTime = checkOutTime
          ? DateTime.fromISO(checkOutTime).toFormat("HH:mm:ss")
          : null;
      } catch (error) {
        formattedCheckOutTime = checkOutTime;
      }

      const checkInPhoto =
        req.files && req.files["checkInPhoto"]
          ? req.files["checkInPhoto"][0].filename
          : "";
      const checkOutPhoto =
        req.files && req.files["checkOutPhoto"]
          ? req.files["checkOutPhoto"][0].filename
          : "";

      const attendanceStatus = getAttendanceStatus(formattedCheckInTime);

      const totalHours = calculateTotalHours(
        formattedCheckInTime,
        formattedCheckOutTime,
        shift
      );

      const newAttendance = new Attendance({
        employeeID,
        checkInTime: formattedCheckInTime,
        checkOutTime: formattedCheckOutTime,
        attendanceDate,
        checkInPhoto,
        checkOutPhoto,
        attendanceStatus,
        shift,
        totalHours,
      });

      await newAttendance.save();

      res.status(201).json({
        success: true,
        message: "Attendance recorded successfully!",
        attendance: newAttendance,
      });
    } catch (error) {
      console.error("Error in attendance post:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error. Try again later." });
    }
  }
);

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

    let checkInTime = checkinRecord ? checkinRecord.checkInTime : null;
    let checkOutTime = checkoutRecord ? checkoutRecord.checkOutTime : null;
    let checkInPhoto = checkinRecord ? checkinRecord.checkInPhoto : null;
    let checkOutPhoto = checkoutRecord ? checkoutRecord.checkOutPhoto : null;
    let shift = checkinRecord ? checkinRecord.shift : null;

    const attendanceStatus = getAttendanceStatus(checkInTime);
    const totalHours = calculateTotalHours(checkInTime, checkOutTime, shift);

    const attendance = await Attendance.findOneAndUpdate(
      { employeeID: employeeObjectId, attendanceDate },
      {
        employeeID: employeeObjectId,
        checkInTime,
        checkOutTime,
        checkInPhoto,
        checkOutPhoto,
        attendanceDate,
        attendanceStatus,
        shift,
        totalHours,
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
    const { employeeID, isAdmin, startDate, endDate } = req.query;
    let attendanceRecords;
    let query = {};

    if (startDate && endDate) {
      query.attendanceDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (isAdmin === "true") {
      attendanceRecords = await Attendance.find(query)
        .populate("employeeID", "firstName lastName _id")
        .lean();
    } else if (employeeID) {
      const employeeObjectId = new mongoose.Types.ObjectId(employeeID);
      query.employeeID = employeeObjectId;

      attendanceRecords = await Attendance.find(query)
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
      attendanceStatus: record.attendanceStatus,
      shift: record.shift,
      totalHours: record.totalHours || 0,
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

router.put(
  "/update/:id",
  upload.fields([
    { name: "checkInPhoto", maxCount: 1 },
    { name: "checkOutPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { employeeID, attendanceDate, checkInTime, checkOutTime, shift } =
        req.body;
      const attendanceRecord = await Attendance.findById(req.params.id);

      if (!attendanceRecord) {
        return res
          .status(404)
          .json({ message: "Attendance record not found." });
      }

      const formattedCheckInTime = checkInTime
        ? DateTime.fromISO(checkInTime).toFormat("HH:mm:ss")
        : attendanceRecord.checkInTime;
      const formattedCheckOutTime = checkOutTime
        ? DateTime.fromISO(checkOutTime).toFormat("HH:mm:ss")
        : attendanceRecord.checkOutTime;

      const formattedDate =
        DateTime.fromISO(attendanceDate).toFormat("MM-dd-yyyy");

      let newCheckInPhoto = attendanceRecord.checkInPhoto;
      if (req.files && req.files["checkInPhoto"]) {
        const fileExt = path.extname(req.files["checkInPhoto"][0].originalname);
        newCheckInPhoto = `checkin_${employeeID}_${formattedDate}${fileExt}`;

        if (
          attendanceRecord.checkInPhoto &&
          attendanceRecord.checkInPhoto !== newCheckInPhoto
        ) {
          const oldCheckInPhotoPath = path.join(
            __dirname,
            "../../frontend/public/employee-checkin-photos",
            attendanceRecord.checkInPhoto
          );

          if (fs.existsSync(oldCheckInPhotoPath)) {
            fs.unlinkSync(oldCheckInPhotoPath);
          }
        }
      }

      let newCheckOutPhoto = attendanceRecord.checkOutPhoto;
      if (req.files && req.files["checkOutPhoto"]) {
        const fileExt = path.extname(
          req.files["checkOutPhoto"][0].originalname
        );
        newCheckOutPhoto = `checkout_${employeeID}_${formattedDate}${fileExt}`;

        if (
          attendanceRecord.checkOutPhoto &&
          attendanceRecord.checkOutPhoto !== newCheckOutPhoto
        ) {
          const oldCheckOutPhotoPath = path.join(
            __dirname,
            "../../frontend/public/employee-checkout-photos",
            attendanceRecord.checkOutPhoto
          );

          if (fs.existsSync(oldCheckOutPhotoPath)) {
            fs.unlinkSync(oldCheckOutPhotoPath);
          }
        }
      }

      const attendanceStatus = getAttendanceStatus(formattedCheckInTime, shift);
      const totalHours = calculateTotalHours(
        formattedCheckInTime,
        formattedCheckOutTime,
        shift
      );

      attendanceRecord.employeeID = employeeID;
      attendanceRecord.attendanceDate = attendanceDate;
      attendanceRecord.checkInTime = formattedCheckInTime;
      attendanceRecord.checkOutTime = formattedCheckOutTime;
      attendanceRecord.checkInPhoto = newCheckInPhoto;
      attendanceRecord.checkOutPhoto = newCheckOutPhoto;
      attendanceRecord.attendanceStatus = attendanceStatus;
      attendanceRecord.shift = shift;
      attendanceRecord.totalHours = totalHours;

      await attendanceRecord.save();

      res.status(200).json({
        success: true,
        message: "Attendance updated successfully!",
        attendance: attendanceRecord,
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({
        message: "Server error. Please try again.",
        error: error.message,
      });
    }
  }
);

router.post("/attendance/checkout", handleAttendanceCheckout);

router.post("/attendance/overtime", handleOvertime);

module.exports = router;
