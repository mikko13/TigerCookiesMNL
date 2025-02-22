require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cron = require("node-cron");
const Payroll = require("./models/payroll");
const Employee = require("./models/Employees");
const Attendance = require("./models/Attendance");
const employeeRoutes = require("./routes/employeeRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const { frontendURL } = require("./urls/URL");


dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: `${frontendURL}`,
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

// ✅ Helper function to calculate work hours
function calculateHours(startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  let diff = (end - start) / 3600000;
  if (diff < 0) diff += 24;
  return diff;
}

// ✅ Generate Payroll Function (Updated with `employeeID`)
const generatePayroll = async (payPeriodStart, payPeriodEnd, payPeriodLabel) => {
  try {
    console.log(`🔄 Generating payroll for ${payPeriodLabel}...`);

    const employeesWithAttendance = await Attendance.aggregate([
      { $match: { attendanceDate: { $gte: payPeriodStart, $lte: payPeriodEnd } } },
      { $group: { _id: "$employeeID" } }
    ]);

    const employeeIds = employeesWithAttendance.map(record => record._id);
    if (employeeIds.length === 0) {
      console.log("❌ No employees have attendance for this period.");
      return;
    }

    const employees = await Employee.find({ _id: { $in: employeeIds } });

    for (const employee of employees) {
      const attendanceRecords = await Attendance.find({
        employeeID: employee._id,
        attendanceDate: { $gte: payPeriodStart, $lte: payPeriodEnd }
      });

      if (attendanceRecords.length === 0) continue;

      let totalHours = 0;
      attendanceRecords.forEach(({ checkInTime, checkOutTime }) => {
        if (checkInTime && checkOutTime) {
          totalHours += calculateHours(checkInTime, checkOutTime);
        }
      });

      const salary = totalHours * employee.ratePerHour;
      
      // ✅ Fix payroll lookup to use `employeeID`
      const existingPayroll = await Payroll.findOne({ employeeID: employee._id, payPeriod: payPeriodLabel });
      if (existingPayroll) continue;

      const newPayroll = new Payroll({
        employeeID: employee._id, // ✅ Use employeeID instead of employeeName
        employeeName: `${employee.firstName} ${employee.lastName}`, // Keeping for reference
        payPeriod: payPeriodLabel,
        salary,
        holidayPay: 0,
        incentives: 0,
        totalDeduction: 0,
        totalEarnings: salary,
        isPublished: false
      });

      await newPayroll.save();
    }

    console.log(`✅ Payroll successfully generated for ${payPeriodLabel}`);
  } catch (error) {
    console.error(`❌ Payroll generation failed for ${payPeriodLabel}:`, error);
  }
};

// ✅ Automated Payroll Generation (Every 6th and 21st)
cron.schedule("0 0 6,21 * *", async () => {
  const today = new Date();
  let payPeriodStart, payPeriodEnd, payPeriodLabel;

  if (today.getDate() === 6) {
    payPeriodStart = new Date(today.getFullYear(), today.getMonth() - 1, 21);
    payPeriodEnd = new Date(today.getFullYear(), today.getMonth(), 5);
    payPeriodLabel = `${today.getFullYear()}-${today.getMonth()} 21-5`;
  } else if (today.getDate() === 21) {
    payPeriodStart = new Date(today.getFullYear(), today.getMonth(), 6);
    payPeriodEnd = new Date(today.getFullYear(), today.getMonth(), 20);
    payPeriodLabel = `${today.getFullYear()}-${today.getMonth() + 1} 6-20`;
  }

  await generatePayroll(payPeriodStart, payPeriodEnd, payPeriodLabel);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
