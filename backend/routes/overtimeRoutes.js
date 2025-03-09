const express = require("express");
const router = express.Router();
const Overtime = require("../models/Overtime");
const Admin = require("../models/Admin");
const Employee = require("../models/Employees");
const emailNotification = require("../services/emailNotification");

// 🔹 Function to send email notifications
async function notifyAdmins(employeeID, overtimeTime, overtimeNote) {
  try {
    // Fetch employee details
    const employee = await Employee.findById(employeeID);
    if (!employee) {
      console.error("Employee not found.");
      return;
    }

    // Fetch all admin emails
    const admins = await Admin.find({}, "firstName lastName email");
    const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

    if (adminEmails.length > 0) {
      // Send email notification to all admins
      await Promise.all(
        admins.map((admin) =>
          emailNotification.sendOvertimeRequestEmail(
            admin.email,
            `${admin.firstName} ${admin.lastName}`, // Admin's full name
            employee.name,
            overtimeTime,
            overtimeNote
          )
        )
      );
    }
  } catch (error) {
    console.error("Error sending email notifications:", error);
  }
}

// 🔹 POST: Create a new overtime request
router.post("/", async (req, res) => {
  try {
    const { employeeID, overtimeTime, overtimeNote } = req.body;

    // Create new overtime request
    const overtimeRequest = new Overtime(req.body);
    const newOvertime = await overtimeRequest.save();

    // Trigger email notification in the background (no delay for user response)
    notifyAdmins(employeeID, overtimeTime, overtimeNote);

    res.status(201).json(newOvertime);
  } catch (error) {
    console.error("Error submitting overtime request:", error);
    res.status(500).json({ message: "Failed to submit overtime request." });
  }
});

// 🔹 GET: Fetch overtime records for a specific employee
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

// 🔹 GET: Fetch all overtime records
router.get("/all", async (req, res) => {
  try {
    const overtimeRecords = await Overtime.find();
    res.status(200).json(overtimeRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 PUT: Update an overtime record status
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOvertime = await Overtime.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedOvertime) {
      return res.status(404).json({ message: "Overtime record not found." });
    }
    res.status(200).json(updatedOvertime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 DELETE: Remove an overtime record
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
