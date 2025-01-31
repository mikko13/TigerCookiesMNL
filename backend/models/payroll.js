const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  payPeriod: { type: String, required: true },
  hoursWorked: { type: Number, required: true },
  hourlyRate: { type: Number, required: true }, // Store hourly rate
  overtimeHours: { type: Number, default: 0 }, // Track overtime hours separately
  overtimePay: { type: Number, default: 0 }, // Track overtime pay separately
  salary: { type: Number, required: true },
},
{ timestamps: true, collection: "empPayrolls" });

// sa gumagawa neto adjust nyo yung laman nito, itugma nyo sa class diagram sa sdd

module.exports = mongoose.model('Payroll', payrollSchema);
