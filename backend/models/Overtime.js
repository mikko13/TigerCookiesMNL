const mongoose = require("mongoose");

const OvertimeSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    dateRequested: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      required: true,
    },
    overtimeTime: {
      type: Number,
      required: true,
    },
    overtimeNote: {
      type: String,
      required: true,
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'], 
      default: 'Pending',
      required: true
    },
    reviewedBy: {
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      adminName: String,
    },
    reviewedAt: Date,
  },
  { timestamps: true, collection: "empOvertime" }
);

module.exports = mongoose.model("Overtime", OvertimeSchema);
