const express = require("express");
const Payroll = require("../models/payroll");
const Attendance = require("../models/Attendance");
const Account = require("../models/Employees"); // Ensure correct reference
const router = express.Router();

// Function to calculate salary based on attendance
const calculateSalary = async (employeeID) => {
  const employee = await Account.findById(employeeID);
  if (!employee) return null;

  const attendanceRecords = await Attendance.find({ employeeID });

  const totalHours = attendanceRecords.reduce((sum, record) => {
    const checkIn = new Date(`1970-01-01T${record.checkInTime}`);
    const checkOut = new Date(`1970-01-01T${record.checkOutTime}`);
    return sum + (checkOut - checkIn) / (1000 * 60 * 60); // Convert milliseconds to hours
  }, 0);

  const salary = totalHours * employee.ratePerHour;
  return salary;
};

// 🟢 Ensure payroll is created for employees
const createPayrollRecord = async (employee) => {
  const existingPayroll = await Payroll.findOne({ employeeID: employee._id });

  if (!existingPayroll) {
    const salary = await calculateSalary(employee._id);
    const newPayroll = new Payroll({
      employeeID: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      payPeriod: "Current Month",
      salary: salary || 0,
      totalEarnings: salary || 0,
    });

    await newPayroll.save();
  }
};

// 🟢 GET pending payrolls (Fixes empty table issue)
router.get("/pending", async (req, res) => {
  try {
    const payrolls = await Payroll.find({ isPublished: false });
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payrolls", error });
  }
});

// 🟢 Sync payroll with attendance records
router.put("/update-payroll/:employeeID", async (req, res) => {
  const { employeeID } = req.params;
  try {
    const salary = await calculateSalary(employeeID);
    await Payroll.findOneAndUpdate(
      { employeeID },
      { salary, totalEarnings: salary },
      { new: true }
    );
    res.status(200).json({ message: "Payroll updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating payroll", error });
  }
});

// Ensure payroll records exist for all employees on startup
const initializePayrolls = async () => {
  const employees = await Account.find();
  for (let employee of employees) {
    await createPayrollRecord(employee);
  }
};

initializePayrolls(); // Run this on server start

module.exports = router;
