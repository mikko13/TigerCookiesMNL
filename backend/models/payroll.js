const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    payPeriod: {
      type: String,
      required: true,
    },
    regularHours: {
      type: Number,
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    holidayPay: {
      type: Number,
      default: 0,
    },
    overtimePay: {
      type: Number,
      default: 0,
    },
    nightDiffPay: {
      type: Number,
      default: 0,
    },
    incentives: {
      type: Number,
      default: 0,
    },
    thirteenthMonthPay: {
      type: Number,
      default: 0,
    },
    sssDeduction: {
      type: Number,
      default: 0,
    },
    philhealthDeduction: {
      type: Number,
      default: 0,
    },
    pagibigDeduction: {
      type: Number,
      default: 0,
    },
    withholdingTax: {
      type: Number,
      default: 0,
    },
    otherDeductions: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      required: true,
    },
    totalDeductions: {
      type: Number,
      required: true,
    },
    netPay: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, collection: "empPayrolls" }
);

module.exports = mongoose.model("Payroll", payrollSchema);
