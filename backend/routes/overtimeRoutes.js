const express = require("express");
const router = express.Router();
const Overtime = require("../models/Overtime");

// POST: Create a new overtime record
router.post("/", async (req, res) => {
  try {
    const overtimeRequest = new Overtime(req.body);
    const newOvertime = await overtimeRequest.save();
    res.status(201).json(newOvertime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🔹 GET: Fetch overtime records for a specific employee
router.get("/", async (req, res) => {
  try {
    const { employeeID } = req.query; // Get employeeID from query parameters

    if (!employeeID) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    const overtimeRecords = await Overtime.find({ employeeID }); // Find overtime by employee ID
    res.status(200).json(overtimeRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
