const express = require("express");
const router = express.Router();
const Overtime = require("../models/Overtime");
const Admin = require("../models/Admin");
const Employee = require("../models/Employees");
const emailNotification = require("../services/emailNotification");

async function notifyAdmins(employeeID, overtimeTime, overtimeNote) {
  try {
    const employee = await Employee.findById(employeeID);
    if (!employee) {
      return;
    }

    const employeeFullName = `${employee.firstName} ${employee.lastName}`;

    const admins = await Admin.find({}, "firstName lastName email");
    const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

    if (adminEmails.length > 0) {
      await Promise.all(
        admins.map((admin) =>
          emailNotification.sendOvertimeRequestEmail(
            admin.email,
            `${admin.firstName} ${admin.lastName}`,
            employeeFullName,
            overtimeTime,
            overtimeNote
          )
        )
      );
    }
  } catch (error) {}
}

router.post("/", async (req, res) => {
  try {
    const { employeeID, overtimeTime, overtimeNote } = req.body;

    // Set default status if not provided
    const status = req.body.status || "Pending";

    // Create overtime request with all body data and explicitly set status
    const overtimeRequest = new Overtime({
      ...req.body,
      status,
      // dateRequested will be automatically set by the schema default
    });

    const newOvertime = await overtimeRequest.save();

    notifyAdmins(employeeID, overtimeTime, overtimeNote);

    res.status(201).json(newOvertime);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to submit overtime request.",
        error: error.message,
      });
  }
});

router.get("/", async (req, res) => {
  try {
    const { employeeID } = req.query;
    if (!employeeID) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    const overtimeRecords = await Overtime.find({ employeeID });
    res.status(200).json(overtimeRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const overtimeRecords = await Overtime.find();
    res.status(200).json(overtimeRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get admin info from session
    const adminId = req.session.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the admin who is approving/rejecting
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update overtime record
    const overtimeRecord = await Overtime.findById(id);
    if (!overtimeRecord) {
      return res.status(404).json({ message: "Overtime record not found." });
    }

    // Store admin info in the record
    overtimeRecord.status = status;
    overtimeRecord.reviewedBy = {
      adminId: admin._id,
      adminName: `${admin.firstName} ${admin.lastName}`,
    };
    overtimeRecord.reviewedAt = new Date();

    const updatedOvertime = await overtimeRecord.save();

    // Send email notification to employee
    const employee = await Employee.findById(overtimeRecord.employeeID);
    if (employee && employee.email) {
      await emailNotification.sendOvertimeStatusEmail(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        `${admin.firstName} ${admin.lastName}`,
        overtimeRecord.overtimeTime,
        overtimeRecord.overtimeNote,
        status
      );
    }

    res.status(200).json(updatedOvertime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOvertime = await Overtime.findByIdAndDelete(id);
    if (!deletedOvertime) {
      return res.status(404).json({ message: "Overtime record not found." });
    }
    res.status(200).json({ message: "Overtime record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
