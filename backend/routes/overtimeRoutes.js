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

// GET: Fetch all overtime records
router.get("/all", async (req, res) => {
  try {
    const overtimeRecords = await Overtime.find(); // Fetch all overtime records
    res.status(200).json(overtimeRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update an overtime record status
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedOvertime = await Overtime.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedOvertime) {
      return res.status(404).json({ message: "Overtime record not found." });
    }
    res.status(200).json(updatedOvertime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Remove an overtime record
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOvertime = await Overtime.findByIdAndDelete(id);
    if (!deletedOvertime) {
      return res.status(404).json({ message: "Overtime record not found." });
    }
    res.status(200).json({ message: "Overtime record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;