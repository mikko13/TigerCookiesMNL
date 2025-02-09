const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { DateTime } = require("luxon"); 
const Checkin = require("../models/Checkin");

const router = express.Router();

const storageDir = path.join(__dirname, "../../frontend/public/employee-checkin-photos");

fs.ensureDirSync(storageDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const { employeeID } = req.body;

    const philippineTime = DateTime.now().setZone("Asia/Manila");
    const formattedDate = philippineTime.toFormat("MM-dd-yyyy");

    const uniqueFilename = `checkin_${employeeID}_${formattedDate}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("checkInPhoto"), async (req, res) => {
  try {
    const { employeeID } = req.body;

    if (!employeeID || !req.file) {
      return res.status(400).json({ success: false, message: "Employee ID and photo are required." });
    }

    const philippineTime = DateTime.now().setZone("Asia/Manila");
    const checkInTime = philippineTime.toFormat("HH:mm:ss");

    const filenameParts = req.file.filename.split("_");
    const checkInDate = filenameParts[2].replace(".png", "");

    const newCheckin = new Checkin({
      employeeID,
      checkInTime,
      checkInDate, 
      checkInPhoto: req.file.filename,
    });

    await newCheckin.save();
    res.status(201).json({ success: true, message: "Check-in recorded successfully!" });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

router.get("/status/:employeeID", async (req, res) => {
  try {
    const { employeeID } = req.params;
    const today = DateTime.now().setZone("Asia/Manila").toFormat("MM-dd-yyyy");

    const checkinRecord = await Checkin.findOne({ employeeID, checkInDate: today });

    res.json({ checkedIn: !!checkinRecord });
  } catch (error) {
    console.error("Error checking check-in status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
