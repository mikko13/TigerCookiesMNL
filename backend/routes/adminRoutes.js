const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/public/admin-profile-pics"));
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
    const { firstName, lastName, email, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "admin",
      isActive: 1,
    });

    if (req.file) {
      const newFilename = `${admin._id}_profilepic${path.extname(
        req.file.originalname
      )}`;
      const newFilePath = path.join(path.dirname(req.file.path), newFilename);
      fs.renameSync(req.file.path, newFilePath);
      admin.profilePicture = newFilename;
    }

    await admin.save();
    res
      .status(201)
      .json({ message: "Admin account created successfully", admin });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.user = {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
    };
    res
      .status(200)
      .json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
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
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", upload.single("profilePicture"), async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role, isActive } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }

    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.email = email || admin.email;
    admin.role = role || admin.role;
    admin.isActive = isActive !== undefined ? isActive : admin.isActive;

    if (req.body.profilePicture === "") {
      const oldFilePath = path.join(
        __dirname,
        `../../frontend/public/admin-profile-pics/${admin.profilePicture}`
      );
      if (admin.profilePicture && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      admin.profilePicture = "";
    }

    if (req.file) {
      const oldFilePath = path.join(
        __dirname,
        `../../frontend/public/admin-profile-pics/${admin.profilePicture}`
      );
      if (admin.profilePicture && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      const newFilename = `${admin._id}_profilepic${path.extname(
        req.file.originalname
      )}`;
      const newFilePath = path.join(path.dirname(req.file.path), newFilename);
      fs.renameSync(req.file.path, newFilePath);
      admin.profilePicture = newFilename;
    }

    await admin.save();
    res.status(200).json({
      message: "Admin updated successfully",
      admin: {
        ...admin.toObject(),
        profilePicture: admin.profilePicture
          ? `/admin-profile-pics/${admin.profilePicture}`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.profilePicture) {
      const filePath = path.join(
        __dirname,
        `../../frontend/public/admin-profile-pics/${admin.profilePicture}`
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Admin.deleteOne({ _id: id });
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
