const mongoose = require("mongoose");

const OvertimeSchema = new mongoose.Schema(
  {
    employeeID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
          required: true,
        },
    
    overtimeTime: {
      type: String,
      required: true,
    },
    overtimeNote: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "empOvertime" }
);

module.exports = mongoose.model("Overtime", OvertimeSchema);
