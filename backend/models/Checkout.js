const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    checkOutTime: {
      type: String,
      required: true,
    },
    checkOutDate: {
      type: String,
      required: true,
    },
    checkOutPhoto: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "empCheckOut" }
);

module.exports = mongoose.model("Checkout", CheckoutSchema);
