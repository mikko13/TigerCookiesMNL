const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const Account = require("../models/Employees");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, "../../frontend/public/employee-profile-pics")
    );
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("profilePicture"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      address,
      gender,
      dateOfBirth,
      position,
      hiredDate,
      status,
      ratePerHour,
      shift,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await Account.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      gender,
      dateOfBirth,
      hiredDate,
      position,
      status,
      ratePerHour,
      shift,
    });

    if (req.file) {
      const newFilename = `${account._id}_profilepic${path.extname(
        req.file.originalname
      )}`;
      const newFilePath = path.join(path.dirname(req.file.path), newFilename);

      const fs = require("fs");
      fs.renameSync(req.file.path, newFilePath);

      account.profilePicture = newFilename;
      await account.save();
    }

    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const employees = await Account.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
