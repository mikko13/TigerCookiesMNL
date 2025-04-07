const express = require("express");
const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Models
const Attendance = require("../models/Attendance");
const Account = require("../models/Employees");
const Checkin = require("../models/Checkin");
const Checkout = require("../models/Checkout");

// Controllers
const { handleAttendanceCheckout, handleOvertime } = require("../controllers/attendanceController");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const basePath = path.join(__dirname, "../../frontend/public");
    const subfolder = file.fieldname === "checkInPhoto" 
      ? "employee-checkin-photos" 
      : "employee-checkout-photos";
    cb(null, path.join(basePath, subfolder));
  },
  filename: (req, file, cb) => {
    const { employeeID, attendanceDate } = req.body;
    const formattedDate = attendanceDate
      ? DateTime.fromISO(attendanceDate).toFormat("MM-dd-yyyy")
      : DateTime.now().toFormat("MM-dd-yyyy");

    const fileExt = path.extname(file.originalname);
    const prefix = file.fieldname === "checkInPhoto" ? "checkin" : "checkout";
    const filename = `${prefix}_${employeeID}_${formattedDate}${fileExt}`;
    
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  cb(null, allowedMimeTypes.includes(file.mimetype));
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper functions
const getAttendanceStatus = (checkInTime, shift) => {
  if (!checkInTime) return "Absent";

  const checkInTimeObj = DateTime.fromFormat(checkInTime, "HH:mm:ss");
  let lateThreshold;

  switch (shift.toLowerCase()) {
    case "afternoon":
      lateThreshold = DateTime.fromFormat("13:01:00", "HH:mm:ss");
      break;
    case "morning":
    default:
      lateThreshold = DateTime.fromFormat("09:01:00", "HH:mm:ss");
  }

  return checkInTimeObj >= lateThreshold ? "Late" : "Present";
};

const calculateTotalHours = (checkInTime, checkOutTime, shift) => {
  if (!checkInTime || !checkOutTime) return 0;

  try {
    let checkIn = DateTime.fromFormat(checkInTime, "HH:mm:ss");
    const checkOut = DateTime.fromFormat(checkOutTime, "HH:mm:ss");

    // Determine shift start time
    let shiftStart;
    switch (shift.toLowerCase()) {
      case "afternoon":
        shiftStart = DateTime.fromFormat("13:00:00", "HH:mm:ss");
        break;
      case "morning":
      default:
        shiftStart = DateTime.fromFormat("09:00:00", "HH:mm:ss");
    }

    // Adjust check-in time if before shift start
    checkIn = checkIn < shiftStart ? shiftStart : checkIn;

    // Calculate lateness penalty
    let latenessHours = 0;
    if (checkIn > shiftStart) {
      const minutesLate = checkIn.diff(shiftStart, "minutes").minutes;
      latenessHours = minutesLate > 0 ? Math.ceil(minutesLate / 60) : 0;
    }

    // Calculate total hours worked
    let diff = checkOut.diff(checkIn, "hours").hours;
    if (diff < 0) {
      diff = checkOut.plus({ days: 1 }).diff(checkIn, "hours").hours;
    }

    return Math.max(0, Math.round((diff - latenessHours) * 100) / 100);
  } catch (error) {
    console.error("Error calculating total hours:", error);
    return 0;
  }
};

// Routes

// Create attendance record
router.post(
  "/post",
  upload.fields([
    { name: "checkInPhoto", maxCount: 1 },
    { name: "checkOutPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { employeeID, attendanceDate, checkInTime, checkOutTime, shift, startOT, endOT } = req.body;

      // Validation
      if (!employeeID || !attendanceDate || !checkInTime || !shift) {
        return res.status(400).json({
          success: false,
          message: "Employee ID, date, check in time, and shift are required.",
        });
      }

      // Format times
      const formatTime = (time) => time ? DateTime.fromISO(time).toFormat("HH:mm:ss") : null;
      const formattedCheckInTime = formatTime(checkInTime);
      const formattedCheckOutTime = formatTime(checkOutTime);

      // Get photo filenames
      const checkInPhoto = req.files?.["checkInPhoto"]?.[0]?.filename || "";
      const checkOutPhoto = req.files?.["checkOutPhoto"]?.[0]?.filename || "";

      // Create new attendance record
      const newAttendance = new Attendance({
        employeeID,
        checkInTime: formattedCheckInTime,
        checkOutTime: formattedCheckOutTime,
        attendanceDate,
        checkInPhoto,
        checkOutPhoto,
        attendanceStatus: getAttendanceStatus(formattedCheckInTime, shift),
        shift,
        totalHours: calculateTotalHours(formattedCheckInTime, formattedCheckOutTime, shift),
        startOT: formatTime(startOT),
        endOT: formatTime(endOT),
      });

      await newAttendance.save();

      res.status(201).json({
        success: true,
        message: "Attendance recorded successfully!",
        attendance: newAttendance,
      });
    } catch (error) {
      console.error("Error in attendance post:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error. Try again later.",
        error: error.message 
      });
    }
  }
);

// Record attendance from checkin/checkout
const recordAttendance = async (employeeID) => {
  try {
    if (!employeeID) {
      return { success: false, message: "Employee ID is required." };
    }

    const philippineTime = DateTime.now().setZone("Asia/Manila");
    const attendanceDate = philippineTime.toFormat("MM-dd-yyyy");
    const employeeObjectId = new mongoose.Types.ObjectId(employeeID);

    // Find existing records
    const [checkinRecord, checkoutRecord] = await Promise.all([
      Checkin.findOne({ employeeID: employeeObjectId, checkInDate: attendanceDate }),
      Checkout.findOne({ employeeID: employeeObjectId, checkOutDate: attendanceDate })
    ]);

    // Create or update attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { employeeID: employeeObjectId, attendanceDate },
      {
        employeeID: employeeObjectId,
        checkInTime: checkinRecord?.checkInTime || null,
        checkOutTime: checkoutRecord?.checkOutTime || null,
        checkInPhoto: checkinRecord?.checkInPhoto || null,
        checkOutPhoto: checkoutRecord?.checkOutPhoto || null,
        attendanceDate,
        attendanceStatus: getAttendanceStatus(checkinRecord?.checkInTime, checkinRecord?.shift),
        shift: checkinRecord?.shift || null,
        totalHours: calculateTotalHours(
          checkinRecord?.checkInTime, 
          checkoutRecord?.checkOutTime, 
          checkinRecord?.shift
        ),
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      message: "Attendance recorded successfully!",
      attendance,
    };
  } catch (error) {
    console.error("Error recording attendance:", error);
    return { 
      success: false, 
      message: "Server error. Please try again.",
      error: error.message
    };
  }
};

router.post("/record", async (req, res) => {
  const result = await recordAttendance(req.body.employeeID);
  res.status(result.success ? 201 : 400).json(result);
});

// Get attendance records
router.get("/", async (req, res) => {
  try {
    const { employeeID, isAdmin, startDate, endDate } = req.query;
    const query = {};
    
    // Date range filter
    if (startDate && endDate) {
      query.attendanceDate = { $gte: startDate, $lte: endDate };
    }

    // Admin vs employee filter
    if (isAdmin !== "true" && !employeeID) {
      return res.status(400).json({ error: "Employee ID or Admin status required" });
    }
    
    if (employeeID) {
      query.employeeID = new mongoose.Types.ObjectId(employeeID);
    }

    // Fetch records with employee details
    const records = await Attendance.find(query)
      .populate("employeeID", "firstName lastName _id")
      .lean();

    // Format response
    const formattedRecords = records.map(record => ({
      ...record,
      employeeID: record.employeeID?._id.toString(),
      employeeName: record.employeeID 
        ? `${record.employeeID.firstName} ${record.employeeID.lastName}`
        : "Unknown Employee",
      checkinTime: record.checkInTime,
      checkoutTime: record.checkOutTime,
      totalHours: record.totalHours || 0
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ 
      error: "Failed to fetch attendance records",
      details: error.message
    });
  }
});

// Update attendance record
router.put(
  "/update/:id",
  upload.fields([
    { name: "checkInPhoto", maxCount: 1 },
    { name: "checkOutPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeID, attendanceDate, checkInTime, checkOutTime, shift, startOT, endOT } = req.body;
      
      const attendanceRecord = await Attendance.findById(id);
      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found." });
      }

      // Format times
      const formatTime = (time, fallback) => time 
        ? DateTime.fromISO(time).toFormat("HH:mm:ss") 
        : fallback;
      
      const formattedCheckInTime = formatTime(checkInTime, attendanceRecord.checkInTime);
      const formattedCheckOutTime = formatTime(checkOutTime, attendanceRecord.checkOutTime);
      const formattedOTStart = formatTime(startOT, attendanceRecord.startOT);
      const formattedOTEnd = formatTime(endOT, attendanceRecord.endOT);

      // Handle file updates
      const handleFileUpdate = (field, oldFilename) => {
        if (!req.files?.[field]) return oldFilename;
        
        const fileExt = path.extname(req.files[field][0].originalname);
        const prefix = field === "checkInPhoto" ? "checkin" : "checkout";
        const newFilename = `${prefix}_${employeeID}_${DateTime.fromISO(attendanceDate).toFormat("MM-dd-yyyy")}${fileExt}`;
        
        // Delete old file if exists and different
        if (oldFilename && oldFilename !== newFilename) {
          const oldPath = path.join(
            __dirname,
            `../../frontend/public/employee-${prefix.replace("check", "check")}-photos`,
            oldFilename
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        
        return newFilename;
      };

      // Update record
      attendanceRecord.employeeID = employeeID || attendanceRecord.employeeID;
      attendanceRecord.attendanceDate = attendanceDate || attendanceRecord.attendanceDate;
      attendanceRecord.checkInTime = formattedCheckInTime;
      attendanceRecord.checkOutTime = formattedCheckOutTime;
      attendanceRecord.checkInPhoto = handleFileUpdate("checkInPhoto", attendanceRecord.checkInPhoto);
      attendanceRecord.checkOutPhoto = handleFileUpdate("checkOutPhoto", attendanceRecord.checkOutPhoto);
      attendanceRecord.attendanceStatus = getAttendanceStatus(formattedCheckInTime, shift || attendanceRecord.shift);
      attendanceRecord.shift = shift || attendanceRecord.shift;
      attendanceRecord.totalHours = calculateTotalHours(formattedCheckInTime, formattedCheckOutTime, shift || attendanceRecord.shift);
      attendanceRecord.startOT = formattedOTStart;
      attendanceRecord.endOT = formattedOTEnd;

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

// Delete attendance record
router.delete("/:id", async (req, res) => {
  try {
    const deletedRecord = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!deletedRecord) {
      return res.status(404).json({ 
        success: false, 
        message: "Attendance record not found." 
      });
    }

    res.json({
      success: true,
      message: "Attendance record deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Try again later.",
      error: error.message
    });
  }
});

// Special routes
router.post("/attendance/checkout", handleAttendanceCheckout);
router.post("/attendance/overtime", handleOvertime);

module.exports = router;