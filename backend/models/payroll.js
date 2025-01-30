const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  payPeriod: { type: String, required: true },
  hoursWorked: { type: Number, required: true },
  hourlyRate: { type: Number, required: true }, // Store hourly rate
  overtimeHours: { type: Number, default: 0 }, // Track overtime hours separately
  overtimePay: { type: Number, default: 0 }, // Track overtime pay separately
  salary: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payroll', payrollSchema);
