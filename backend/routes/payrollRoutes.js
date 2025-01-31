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

// Helper function to calculate pay
function calculatePay(hoursWorked, hourlyRate, holidayPay, incentives, totalDeduction) {
  const regularPay = hoursWorked * hourlyRate;
  return regularPay + holidayPay + incentives - totalDeduction;
}

// === Create a new payroll record ===
router.post('/', async (req, res) => {
  const { employeeId, employeeName, payPeriod, startTime, endTime, salary, holidayPay, incentives, totalDeduction } = req.body;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const hoursWorked = calculateHours(startTime, endTime);
    const hourlyRate = employee.rate; // Use 'rate' from Employee schema

    // Calculate total earnings
    const totalEarnings = calculatePay(hoursWorked, hourlyRate, holidayPay, incentives, totalDeduction);

    const newPayroll = new Payroll({
      employeeName,
      payPeriod,
      salary,
      holidayPay,
      totalDeduction,
      incentives,
      totalEarnings,
    });

    const savedPayroll = await newPayroll.save();
    res.status(201).json(savedPayroll);
  } catch (err) {
    res.status(400).json({ message: 'Error creating payroll record: ' + err.message });
  }
});

module.exports = router;