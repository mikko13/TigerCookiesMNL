const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { DateTime } = require("luxon");
const Checkout = require("../models/Checkout");
const axios = require("axios");

const router = express.Router();

const storageDir = path.join(
  __dirname,
  "../../frontend/public/employee-checkout-photos"
);

fs.ensureDirSync(storageDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const { employeeID } = req.body;

    const philippineTime = DateTime.now().setZone("Asia/Manila");
    const formattedDate = philippineTime.toFormat("MM-dd-yyyy");

    const uniqueFilename = `checkout_${employeeID}_${formattedDate}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("checkOutPhoto"), async (req, res) => {
  try {
    const { employeeID } = req.body;

    if (!employeeID || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and photo are required.",
      });
    }

    const philippineTime = DateTime.now().setZone("Asia/Manila");
    const checkOutTime = philippineTime.toFormat("HH:mm:ss");

    const filenameParts = req.file.filename.split("_");
    const checkOutDateWithExt = filenameParts[2]; 
    const checkOutDate = checkOutDateWithExt.replace(
      path.extname(checkOutDateWithExt),
      ""
    );

    const newCheckout = new Checkout({
      employeeID,
      checkOutTime,
      checkOutDate,
      checkOutPhoto: req.file.filename,
    });

    await newCheckout.save();

    let attendanceResponse;
    try {
      attendanceResponse = await axios.post(
        "http://localhost:5000/api/attendance/record",
        { employeeID }
      );
    } catch (attendanceError) {
      console.error("Attendance recording error:", attendanceError);
    }

    res.status(201).json({
      success: true,
      message: "Check-out recorded successfully.",
      attendance: attendanceResponse ? attendanceResponse.data : "Attendance update failed.",
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

router.get("/status/:employeeID", async (req, res) => {
  try {
    const { employeeID } = req.params;
    const today = DateTime.now().setZone("Asia/Manila").toFormat("MM-dd-yyyy");

    const checkoutRecord = await Checkout.findOne({ employeeID, checkOutDate: today });

    res.json({ checkedOut: !!checkoutRecord });
  } catch (error) {
    console.error("Error checking check-out status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
