const express = require('express');
const router = express.Router();
const Payroll = require('../models/payroll');
const Employee = require('../models/Employees'); // Import Employee model

// Helper function to calculate work hours
function calculateHours(startTime, endTime) {
  const start = parseInt(startTime.split(':')[0]);
  const end = parseInt(endTime.split(':')[0]);
  return end - start;
}

// Helper function to calculate pay with a custom overtime rate
function calculatePay(hoursWorked, hourlyRate, overtimePay, overtimeRate) {
  const regularHours = 8; // Regular working hours per day
  let regularPay = 0;
  let totalOvertimePay = overtimePay || 0;

  if (hoursWorked <= regularHours) {
    regularPay = hoursWorked * hourlyRate;
  } else {
    regularPay = regularHours * hourlyRate;
    totalOvertimePay += (hoursWorked - regularHours) * hourlyRate * overtimeRate;
  }

  return regularPay + totalOvertimePay;
}

// === Create a new payroll record ===
router.post('/', async (req, res) => {
  const { employeeId, employeeName, payPeriod, startTime, endTime, hourlyRate } = req.body;

  try {
    const hoursWorked = calculateHours(startTime, endTime);

    // Fetch the overtime pay from Attendance model
    const attendanceRecord = await Attendance.findOne({ employeeId, payPeriod });
    const overtimePay = attendanceRecord ? attendanceRecord.overtimePay : 0;

    // Fetch the employee's overtime rate from Employee model
    const employee = await Employee.findOne({ employeeId });
    const overtimeRate = employee ? employee.overtimeRate : 1.5; // Default to 1.5 if not found

    // Calculate salary with the custom overtime rate
    const salary = calculatePay(hoursWorked, hourlyRate, overtimePay, overtimeRate);

    const newPayroll = new Payroll({
      employeeId,
      employeeName,
      payPeriod,
      hoursWorked,
      salary,
    });

    const savedPayroll = await newPayroll.save();
    res.status(201).json(savedPayroll);
  } catch (err) {
    res.status(400).json({ message: 'Error creating payroll record: ' + err.message });
  }
});

module.exports = router;
