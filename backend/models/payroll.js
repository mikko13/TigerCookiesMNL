const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    payPeriod: { type: String, required: true },
    salary: { type: Number, required: true },
    holidayPay: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    totalEarnings: { type: Number, required: true },
  },
  { timestamps: true, collection: "empPayrolls" }
);

module.exports = mongoose.model("Payroll", payrollSchema);
