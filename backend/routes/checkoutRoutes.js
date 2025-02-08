const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { DateTime } = require("luxon");
const Checkout = require("../models/Checkout");

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

    const uniqueFilename = `checkout_${employeeID}_${formattedDate}${path.extname(
      file.originalname
    )}`;
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
    const checkOutDate = filenameParts[2].replace(".png", "");

    const newCheckout = new Checkout({
      employeeID,
      checkOutTime,
      checkOutDate,
      checkOutPhoto: req.file.filename,
    });

    await newCheckout.save();
    res
      .status(201)
      .json({ success: true, message: "Check-out recorded successfully!" });
  } catch (error) {
    console.error("Check-out error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
});

module.exports = router;
