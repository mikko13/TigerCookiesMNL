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
const Payroll = require("./models/Payroll");
const Employee = require("./models/Employees");
const Attendance = require("./models/Attendance");
const Admin = require("./models/Admin")
const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes")
const payrollRoutes = require("./routes/payrollRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const overtimeRoutes = require("./routes/overtimeRoutes");
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

app.use("/api/admins", adminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/overtime", overtimeRoutes);
app.use("/api/login", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
