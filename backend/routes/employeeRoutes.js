const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const Account = require("../models/Employees");
const router = express.Router();
const fs = require("fs");
const nodemailer = require("nodemailer");
const { sendAccountCreatedEmail } = require("../services/emailNotification");

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

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});


router.post("/", upload.single("profilePicture"), async (req, res) => {
  try {
    const {
      employeeID,
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      gender,
      dateOfBirth,
      hiredDate,
      position,
      ratePerHour,
      overtimeRate,
      role,
      isActive = 0,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await Account.create({
      employeeID,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      address,
      gender,
      dateOfBirth,
      hiredDate,
      position,
      ratePerHour,
      overtimeRate,
      role: role || "employee",
      isActive,
    });

    // Handle profile picture if uploaded
    if (req.file) {
      const newFilename = `${account._id}_profilepic${path.extname(req.file.originalname)}`;
      const newFilePath = path.join(path.dirname(req.file.path), newFilename);
      fs.renameSync(req.file.path, newFilePath);
      account.profilePicture = newFilename;
      await account.save();
    }

    // Prepare email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to the Team!',
      html: `
        <p>Hi ${firstName},</p>
        <p>You are now part of the team!</p>
        <p>Your work email is: ${email}</p>
        <p>Your default password is: ${password}</p>
        <p><a href="http://localhost:3000/">Click here</a> to change your password.</p>
        <p>After logging in, please fill out your personal information.</p>
      `,
    };

    // Send welcome email
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request just because email failed
    }

    // Send response
    res.status(201).json(account);

  } catch (error) {
    console.error("Error creating account:", error);
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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Invalid Email or Password" });
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    if (account.isActive === 0) {
      return res.status(403).json({
        message:
          "Access Denied: Your account has been deactivated. Please contact your administrator for assistance.",
      });
    }

    req.session.user = {
      id: account._id,
      employeeID: account.employeeID,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      phone: account.phone,
      role: account.role,
      isActive: account.isActive,
      isFirstTime: account.isFirstTime, // Add this to track first-time login status
    };

    res.status(200).json({
      message: "Login successful",
      user: req.session.user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

router.post("/check-status", async (req, res) => {
  const { email } = req.body;
  try {
    const account = await Account.findOne({ email });
    if (account) {
      return res.status(200).json({
        isActive: account.isActive,
        isFirstTime: account.isFirstTime, // Add this to track first-time login status
        exists: true,
      });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

router.get("/session", (req, res) => {
  if (req.session.user) {
    if (req.session.user.isActive === 0) {
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Session destruction failed" });
        }
        res.clearCookie("connect.sid");
        return res.status(403).json({ message: "Account is deactivated" });
      });
    } else {
      return res.status(200).json({ user: req.session.user });
    }
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Account.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const filePath = path.join(
      __dirname,
      `../../frontend/public/employee-profile-pics/${employee.profilePicture}`
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await Account.deleteOne({ _id: id });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", upload.single("profilePicture"), async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    gender,
    dateOfBirth,
    position,
    hiredDate,
    ratePerHour,
    overtimeRate,
    role,
    isActive,
    isFirstTime,
    sssNumber,
    philhealthNumber,
    pagibigNumber,
  } = req.body;

  try {
    const employee = await Account.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      employee.password = hashedPassword;
    }

    // Update all fields from the schema
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.address = address || employee.address;
    employee.gender = gender || employee.gender;
    employee.dateOfBirth = dateOfBirth || employee.dateOfBirth;
    employee.position = position || employee.position;
    employee.hiredDate = hiredDate || employee.hiredDate;
    employee.ratePerHour = ratePerHour || employee.ratePerHour;
    employee.overtimeRate = overtimeRate || employee.overtimeRate;
    employee.role = role || employee.role;
    employee.isActive = isActive !== undefined ? isActive : employee.isActive;
    employee.isFirstTime =
      isFirstTime !== undefined ? isFirstTime : employee.isFirstTime;
    employee.sssNumber = sssNumber || employee.sssNumber;
    employee.philhealthNumber = philhealthNumber || employee.philhealthNumber;
    employee.pagibigNumber = pagibigNumber || employee.pagibigNumber;

    if (req.body.profilePicture === "") {
      const oldFilePath = path.join(
        __dirname,
        `../../frontend/public/employee-profile-pics/${employee.profilePicture}`
      );
      if (employee.profilePicture && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      employee.profilePicture = "";
    }

    if (req.file) {
      const oldFilePath = path.join(
        __dirname,
        `../../frontend/public/employee-profile-pics/${employee.profilePicture}`
      );
      if (employee.profilePicture && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      const newFilename = `${employee._id}_profilepic${path.extname(
        req.file.originalname
      )}`;
      const newFilePath = path.join(path.dirname(req.file.path), newFilename);
      fs.renameSync(req.file.path, newFilePath);
      employee.profilePicture = newFilename;
    }

    await employee.save();
    res.status(200).json({
      message: "Employee updated successfully.",
      employee: {
        ...employee.toObject(),
        profilePicture: employee.profilePicture
          ? `/employee-profile-pics/${employee.profilePicture}`
          : "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Account.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    const account = await Account.findOne({ email });
    if (account) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { checkedIn, isAdmin } = req.query;

    let employees;

    if (checkedIn === "true") {
      // This was using an undefined Attendance model and not returning employees properly
      const attendanceRecords = await Attendance.find({
        checkInTime: { $ne: null },
        checkOutTime: null,
      })
        .populate("employeeID", "firstName lastName email")
        .lean();

      // Return the formatted records
      return res.json(
        attendanceRecords.map((record) => ({
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
        }))
      );
    } else if (isAdmin === "true") {
      employees = await Account.find();
      return res.status(200).json(employees);
    } else {
      employees = await Account.find();
      return res.status(200).json(employees);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

router.post("/change-password", async (req, res) => {
  const { userId, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });

  if (!user) {
    return res.status(400).send("User not found");
  }

  res.status(200).send("Password updated successfully");
});

module.exports = router;
