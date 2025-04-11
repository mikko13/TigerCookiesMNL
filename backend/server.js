require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cron = require("node-cron");
const axios = require("axios");
const path = require("path");
const http = require("http");

const Payroll = require("./models/Payroll");
const Employee = require("./models/Employees");
const Attendance = require("./models/Attendance");
const Admin = require("./models/Admin");
const Overtime = require("./models/Overtime");
const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const overtimeRoutes = require("./routes/overtimeRoutes");

const { frontendURL, backendURL } = require("./urls/URL");

dotenv.config();
connectDB();
require("./jobs/autoCheckoutJob");

const app = express();
const server = http.createServer(app); 

// --- Schedule Payroll Job ---
const processPayroll = async () => {
  try {
    console.log("Processing payroll...");
    await axios.post(`${backendURL}/api/payroll/calculate`);
    console.log("Payroll calculated successfully.");
  } catch (error) {
    console.error("Error processing payroll:", error);
  }
};

cron.schedule("0 0 5,20 * *", () => {
  console.log("Running scheduled payroll calculation...");
  processPayroll();
});

// --- Middlewares ---
app.use(
  cors({
    origin: frontendURL,
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

// --- Static Assets ---
app.use('/employee-checkin-photos', express.static(path.join(__dirname, 'public/employee-checkin-photos')));
app.use('/employee-checkout-photos', express.static(path.join(__dirname, 'public/employee-checkout-photos')));

// --- Routes ---
app.use("/api/admins", adminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/overtime", overtimeRoutes);
app.use("/api/login", authRoutes)

// --- API for Pending Overtime Count ---
app.get("/api/overtime/pending-count", async (req, res) => {
  try {
    const count = await Overtime.countDocuments({ status: "Pending" });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching overtime count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const io = require("socket.io")(server, {
  cors: {
    origin: frontendURL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("subscribeToOvertime", async () => {
    const count = await Overtime.countDocuments({ status: "Pending" });
    socket.emit("overtimeUpdate", count);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const notifyOvertimeUpdate = async () => {
  const count = await Overtime.countDocuments({ status: "Pending" });
  io.emit("overtimeUpdate", count);
};

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
