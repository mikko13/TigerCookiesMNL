const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Payroll = require("../models/payroll");
const Employee = require("../models/Employees");
const Attendance = require("../models/Attendance");
const authMiddleware = require("../middleware/authMiddleware"); // JWT Authentication Middleware

// Helper function to calculate work hours
function calculateHours(startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  let diff = (end - start) / 3600000;
  if (diff < 0) diff += 24;
  return diff;
}

// Generate Payroll Function
const generatePayroll = async (payPeriodStart, payPeriodEnd, payPeriodLabel) => {
  try {
    console.log(`🔄 Generating payroll for ${payPeriodLabel}...`);

    // Convert date objects to "YYYY-MM-DD" format
    const start = payPeriodStart.toISOString().split("T")[0];
    const end = payPeriodEnd.toISOString().split("T")[0];

    // Find distinct employee IDs who have attendance within the period
    const employeeIDs = await Attendance.distinct("employeeID", {
      attendanceDate: { $gte: start, $lte: end },
    });

    console.log("🔍 Found Employee IDs:", employeeIDs); // Debugging log

    if (employeeIDs.length === 0) {
      console.log("❌ No employees have attendance for this period.");
      return;
    }

    // Fetch employee details
    const employees = await Employee.find({ _id: { $in: employeeIDs } });

    for (const employee of employees) {
      // Fetch attendance records for the pay period
      const attendanceRecords = await Attendance.find({
        employeeID: employee._id,
        attendanceDate: { $gte: start, $lte: end },
      });

      let totalHours = 0;
      attendanceRecords.forEach(({ checkInTime, checkOutTime }) => {
        if (checkInTime && checkOutTime) {
          totalHours += calculateHours(checkInTime, checkOutTime);
        }
      });

      const salary = totalHours * employee.ratePerHour;

      // Check if payroll already exists
      const existingPayroll = await Payroll.findOne({
        employeeID: employee._id,
        payPeriod: payPeriodLabel,
      });

      if (existingPayroll) continue;

      // Create new payroll record
      const newPayroll = new Payroll({
        employeeID: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        payPeriod: payPeriodLabel,
        salary,
        totalEarnings: salary,
        isPublished: false,
      });

      await newPayroll.save();
    }

    console.log(`✅ Payroll successfully generated for ${payPeriodLabel}`);
  } catch (err) {
    console.error(`❌ Payroll generation failed for ${payPeriodLabel}:`, err.message);
  }
};

// Route to Generate Payroll
router.post("/generate", async (req, res) => {
  try {
    const today = new Date();
    let payPeriodStart, payPeriodEnd, payPeriodLabel;

    if (today.getDate() >= 6 && today.getDate() <= 20) {
      payPeriodStart = new Date(today.getFullYear(), today.getMonth(), 6);
      payPeriodEnd = new Date(today.getFullYear(), today.getMonth(), 20);
      payPeriodLabel = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")} 6-20`;
    } else {
      payPeriodStart = new Date(today.getFullYear(), today.getMonth() - 1, 21);
      payPeriodEnd = new Date(today.getFullYear(), today.getMonth(), 5);
      payPeriodLabel = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, "0")} 21-5`;
    }

    await generatePayroll(payPeriodStart, payPeriodEnd, payPeriodLabel);
    res.json({ message: "Payroll generated successfully" });
  } catch (error) {
    console.error("Error generating payroll:", error);
    res.status(500).json({ error: "Failed to generate payroll" });
  }
});

// ✅ New Route: Fetch Payroll for Logged-in Employee
router.get("/my-payroll", authMiddleware, async (req, res) => {
  try {
    const employeeID = req.user.id; // Get logged-in user's ID from JWT

    if (!mongoose.Types.ObjectId.isValid(employeeID)) {
      return res.status(400).json({ error: "Invalid employee ID format" });
    }

    // Fetch only published payrolls for the logged-in employee
    const payrolls = await Payroll.find({ 
      employeeID, 
      isPublished: true 
    });

    if (!payrolls.length) {
      return res.status(404).json({ message: "No published payroll records found." });
    }

    res.json(payrolls);
  } catch (error) {
    console.error("❌ Error fetching payroll:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to Fetch Payroll by Employee ID (Admin use)
router.get("/employee/:employeeID", async (req, res) => {
  try {
    const { employeeID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeID)) {
      return res.status(400).json({ error: "Invalid employee ID format" });
    }

    const payrolls = await Payroll.find({ employeeID, isPublished: true });

    if (!payrolls.length) {
      return res.status(404).json({ message: "No payroll records found." });
    }

    res.json(payrolls);
  } catch (error) {
    console.error("❌ Error fetching payroll:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to Fetch Pending Payrolls (Not Yet Published)
router.get("/pending", async (req, res) => {
  try {
    const pendingPayrolls = await Payroll.find({ isPublished: false });

    if (!pendingPayrolls.length) {
      return res.status(404).json({ message: "No pending payroll records found." });
    }

    res.json(pendingPayrolls);
  } catch (error) {
    console.error("Error fetching pending payrolls:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Route to Update Payroll Details
router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { salary, holidayPay, totalDeduction, overtimePay, incentives } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid payroll ID format" });
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      id,
      { salary, holidayPay, totalDeduction, overtimePay, incentives },
      { new: true }
    );

    if (!updatedPayroll) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    res.json({ message: "Payroll updated successfully", updatedPayroll });
  } catch (error) {
    console.error("Error updating payroll:", error.message);
    res.status(500).json({ error: "Failed to update payroll" });
  }
});

module.exports = router;
